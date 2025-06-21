import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function fetchRecommendations(prompt: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ✅ use gemini-1.5-flash or gemini-1.5-pro

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Assume the response is a comma-separated list of movie/show titles
  return text.split(",").map(title => title.trim()).filter(Boolean);
}
