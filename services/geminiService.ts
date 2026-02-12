
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client once with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateAnimeMetadata(title: string) {
    // Generate description and genres for a specific anime title using Gemini 3 Flash.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate metadata for the anime "${title}". Format as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            descriptionHindi: { type: Type.STRING },
            descriptionEnglish: { type: Type.STRING },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["descriptionHindi", "descriptionEnglish", "genres"]
        }
      }
    });
    // Access the text property directly (not as a method).
    return JSON.parse(response.text || '{}');
  },

  async getCharacterInfo(title: string) {
    // List characters for an anime using structured JSON output.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 4 main characters from the anime "${title}". For each, provide their name, role (Protagonist, Antagonist, etc.), and a 1-sentence bio in Hindi. Format as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "role", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  async getLatestAnimeNews() {
    // Use Google Search grounding for real-time news about Hindi dubbed anime.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "What is the latest news about Hindi dubbed anime releases in 2024 and 2025 in India? Provide a summary of 5 top news items.",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text || '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources: chunks };
  },

  async animeDostChat(message: string, history: any[] = []) {
    // Use the Chat interface for multi-turn conversation support.
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are "AnimeDost", the official AI assistant for "Anime Lover". Help users find Hindi dubs and explain plots. You respond in a mix of Hindi and English.`,
      },
    });
    const result = await chat.sendMessage({ message });
    return result.text || '';
  }
};
