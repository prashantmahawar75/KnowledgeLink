import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSummary(content: string, title: string): Promise<string> {
  try {
    const prompt = `Please provide a concise summary of this article titled "${title}":

${content}

Focus on the key points, main arguments, and practical insights. Keep it under 200 words and make it informative for someone building a knowledge base.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    return response.text || "No summary available";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary at this time.";
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    return response.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

export async function generateSearchEmbedding(query: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: query,
    });
    return response.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error("Error generating search embedding:", error);
    throw new Error("Failed to generate search embedding");
  }
}
