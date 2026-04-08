import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Task } from "../types";

// Lazy-initialize the Gemini client to prevent top-level crashes
let genAI: GoogleGenerativeAI | null = null;

const getGeminiClient = () => {
  if (genAI) return genAI;
  
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    return null;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

const getNvidiaApiKey = () => {
  return (import.meta as any).env?.VITE_NVIDIA_API_KEY || (process as any).env?.NVIDIA_API_KEY || "";
};

// Helper for NVIDIA AI API (OpenAI compatible)
const getNvidiaAIResponse = async (messages: any[], jsonMode = false) => {
  const apiKey = getNvidiaApiKey();
  if (!apiKey || apiKey === "YOUR_NVIDIA_API_KEY" || apiKey === "") {
    throw new Error("NVIDIA_API_KEY_MISSING");
  }

  const tryModel = async (modelName: string) => {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`NVIDIA_ERROR: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  try {
    return await tryModel("meta/llama-3.1-405b-instruct");
  } catch (error: any) {
    if (error.message === "NVIDIA_API_KEY_MISSING") throw error;
    console.warn("NVIDIA 405B failed, trying 70B fallback:", error);
    return await tryModel("meta/llama-3.1-70b-instruct");
  }
};

export const extractTaskFromText = async (text: string): Promise<Partial<Task> | null> => {
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
    console.error("Gemini failed, trying NVIDIA...");
  }

  try {
    const nvidiaResponse = await getNvidiaAIResponse([
      { role: "system", content: "Extract task details as JSON." },
      { role: "user", content: text }
    ], true);
    return JSON.parse(nvidiaResponse);
  } catch (error) {
    return null;
  }
};

export const getAIChatResponse = async (messages: { role: string, content: string }[], tasks: Task[]) => {
  const taskContext = tasks.map(t => `- ${t.title} (${t.date}, ${t.priority}, ${t.status})`).join('\n');
  const systemPrompt = `You are Aura, an intelligent productivity assistant. 
    You help users plan their day, reschedule tasks, and give productivity advice.
    Current tasks:\n${taskContext}\n
    Keep responses concise, helpful, and encouraging. Use a professional yet warm tone.`;

  let geminiError = "";
  try {
    const ai = getGeminiClient();
    if (ai) {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      const response = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      });
      return response.response.text();
    } else {
      geminiError = "GEMINI_KEY_MISSING";
    }
  } catch (error: any) {
    geminiError = error.message || "GEMINI_UNKNOWN_ERROR";
    console.error("Gemini failed:", error);
  }

  try {
    return await getNvidiaAIResponse([
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]);
  } catch (error: any) {
    console.error("NVIDIA failed:", error);
    if (geminiError === "GEMINI_KEY_MISSING" && error.message === "NVIDIA_API_KEY_MISSING") {
      return "[STATUS: MISSING_KEYS] I'm sorry, both Gemini and NVIDIA API keys are missing. Please add them to your Vercel/Local settings and Redeploy.";
    }
    if (error.message === "NVIDIA_API_KEY_MISSING") {
      return `[STATUS: NVIDIA_KEY_MISSING] Gemini failed with: ${geminiError.substring(0, 50)}. Please check your NVIDIA_API_KEY as a fallback.`;
    }
    return `[STATUS: ERROR] Both AI providers are currently unavailable. Gemini: ${geminiError.substring(0, 30)}... NVIDIA: ${error.message.substring(0, 30)}...`;
  }
};

export const getWeeklyInsights = async (tasks: Task[]) => {
  const taskSummary = tasks.map(t => `${t.title}: ${t.status}`).join(', ');
  const prompt = `Analyze these tasks and provide a brief productivity insight (2-3 sentences): ${taskSummary}`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      const response = await model.generateContent(prompt);
      return response.response.text();
    }
  } catch (error) {
    console.error("Gemini insights failed, trying NVIDIA...");
  }

  try {
    return await getNvidiaAIResponse([
      { role: "system", content: "Analyze productivity." },
      { role: "user", content: prompt }
    ]);
  } catch (error) {
    return "Keep pushing forward! (AI Insights temporarily unavailable)";
  }
};
