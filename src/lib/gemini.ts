import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Task } from "../types";

// Lazy-initialize the Gemini client to prevent top-level crashes
let genAI: GoogleGenerativeAI | null = null;

const getGeminiClient = () => {
  if (genAI) return genAI;
  
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

const getNvidiaApiKey = () => {
  return (import.meta as any).env?.VITE_NVIDIA_API_KEY || (process as any).env?.NVIDIA_API_KEY;
};

// Helper for NVIDIA AI API (OpenAI compatible)
const getNvidiaAIResponse = async (messages: any[], jsonMode = false) => {
  const apiKey = getNvidiaApiKey();
  if (!apiKey || apiKey === "YOUR_NVIDIA_API_KEY") {
    throw new Error("NVIDIA API Key is missing.");
  }

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-405b-instruct",
      messages: messages,
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NVIDIA AI error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const extractTaskFromText = async (text: string): Promise<Partial<Task> | null> => {
  // Try Gemini first
  try {
    const ai = getGeminiClient();
    if (ai) {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Extract task details from this text: "${text}". 
        Current date/time: ${new Date().toISOString()}.
        Return JSON with: title, date (ISO string), priority (low, medium, high), category (work, personal, health).` }]}],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              date: { type: SchemaType.STRING },
              priority: { type: SchemaType.STRING, enum: ['low', 'medium', 'high'], format: "enum" },
              category: { type: SchemaType.STRING, enum: ['work', 'personal', 'health'], format: "enum" },
            },
            required: ["title", "date"]
          }
        }
      });
      return JSON.parse(response.response.text());
    }
  } catch (error) {
    console.warn("Gemini extraction failed, falling back to NVIDIA:", error);
  }

  // Fallback to NVIDIA
  try {
    const nvidiaResponse = await getNvidiaAIResponse([
      { 
        role: "system", 
        content: `Extract task details from the provided text. Return ONLY valid JSON.
        Current date/time: ${new Date().toISOString()}.
        JSON format: { "title": string, "date": "ISO string", "priority": "low"|"medium"|"high", "category": "work"|"personal"|"health" }` 
      },
      { role: "user", content: text }
    ], true);
    return JSON.parse(nvidiaResponse);
  } catch (error) {
    console.error("All AI extractions failed:", error);
    return null;
  }
};

export const getAIChatResponse = async (messages: { role: string, content: string }[], tasks: Task[]) => {
  const taskContext = tasks.map(t => `- ${t.title} (${t.date}, ${t.priority}, ${t.status})`).join('\n');
  const systemPrompt = `You are Aura, an intelligent productivity assistant. 
    You help users plan their day, reschedule tasks, and give productivity advice.
    Current tasks:\n${taskContext}\n
    Keep responses concise, helpful, and encouraging. Use a professional yet warm tone.`;

  // Try Gemini first
  try {
    const ai = getGeminiClient();
    if (ai) {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      const response = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      });
      return response.response.text();
    }
  } catch (error) {
    console.warn("Gemini chat failed, falling back to NVIDIA:", error);
  }

  // Fallback to NVIDIA
  try {
    return await getNvidiaAIResponse([
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]);
  } catch (error) {
    console.error("All AI chat providers failed:", error);
    return "I'm sorry, I'm having trouble connecting to all my AI systems right now. Please check your API keys or try again later.";
  }
};

export const getWeeklyInsights = async (tasks: Task[]) => {
  const taskSummary = tasks.map(t => `${t.title}: ${t.status}`).join(', ');
  const prompt = `Analyze these tasks and provide a brief productivity insight (2-3 sentences): ${taskSummary}`;

  // Try Gemini first
  try {
    const ai = getGeminiClient();
    if (ai) {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      const response = await model.generateContent(prompt);
      return response.response.text();
    }
  } catch (error) {
    console.warn("Gemini insights failed, falling back to NVIDIA:", error);
  }

  // Fallback to NVIDIA
  try {
    return await getNvidiaAIResponse([
      { role: "system", content: "You are a productivity expert giving brief, insightful feedback." },
      { role: "user", content: prompt }
    ]);
  } catch (error) {
    console.error("All AI insight providers failed:", error);
    return "Keep pushing forward! Every small step counts towards your goals.";
  }
};
