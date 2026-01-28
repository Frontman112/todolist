
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Category, Priority } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const decomposeTask = async (taskTitle: string): Promise<string[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Break down the following task into 3-5 concise, actionable sub-tasks: "${taskTitle}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const getSmartSuggestions = async (tasks: Task[]): Promise<any> => {
  const ai = getAIClient();
  const taskSummary = tasks.map(t => `${t.title} (${t.priority}, ${t.category})`).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on these tasks: [${taskSummary}], provide a productivity tip and suggest which task should be prioritized next and why.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tip: { type: Type.STRING },
          prioritySuggestion: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["tip", "prioritySuggestion", "reason"]
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { tip: "Keep going!", prioritySuggestion: "Any task", reason: "Stay focused." };
  }
};
