import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Task } from "../types";

// Lazy-initialize the AI client to prevent top-level crashes
let genAI: GoogleGenerativeAI | null = null;

const getAIClient = () => {
  if (genAI) return genAI;
  
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

export const extractTaskFromText = async (text: string): Promise<Partial<Task> | null> => {
  try {
    const ai = getAIClient();
    if (!ai) return null;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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
            priority: { type: SchemaType.STRING, enum: ['low', 'medium', 'high'] },
            category: { type: SchemaType.STRING, enum: ['work', 'personal', 'health'] },
          },
          required: ["title", "date"]
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Error extracting task:", error);
    return null;
  }
};

export const getAIChatResponse = async (messages: { role: string, content: string }[], tasks: Task[]) => {
  try {
    const ai = getAIClient();
    if (!ai) return "AI features are currently unavailable. Please check your API key.";

    const taskContext = tasks.map(t => `- ${t.title} (${t.date}, ${t.priority}, ${t.status})`).join('\n');
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const response = await model.generateContent({
      systemInstruction: `You are Aura, an intelligent productivity assistant. 
        You help users plan their day, reschedule tasks, and give productivity advice.
        Current tasks:\n${taskContext}\n
        Keep responses concise, helpful, and encouraging. Use a professional yet warm tone.`,
      contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
    });

    return response.response.text();
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "I'm sorry, I'm having trouble connecting right now. How else can I help?";
  }
};

export const getWeeklyInsights = async (tasks: Task[]) => {
  try {
    const ai = getAIClient();
    if (!ai) return "Start adding tasks to see your AI-powered performance insights!";

    const taskSummary = tasks.map(t => `${t.title}: ${t.status}`).join(', ');
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const response = await model.generateContent(`Analyze these tasks and provide a brief productivity insight (2-3 sentences): ${taskSummary}`);
    return response.response.text();
  } catch (error) {
    return "Keep pushing forward! Every small step counts towards your goals.";
  }
};
