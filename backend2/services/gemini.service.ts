// backend/services/gemini.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function fetchRecommendations(prompt: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse the response to extract titles
  const recommendations = parseRecommendations(text.trim());
  
  return recommendations;
}

function parseRecommendations(text: string): string[] {
  // Try to extract titles from various formats
  const lines = text.split('\n');
  const recommendations: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Remove common prefixes like "1.", "- ", "• ", etc.
    const cleanedTitle = trimmedLine
      .replace(/^\d+\.\s*/, '') // Remove "1. ", "2. ", etc.
      .replace(/^[-•*]\s*/, '') // Remove "- ", "• ", "* ", etc.
      .replace(/^["""](.+)["""]$/, '$1') // Remove quotes
      .trim();
    
    if (cleanedTitle && recommendations.length < 8) {
      recommendations.push(cleanedTitle);
    }
  }
  
  // If we still don't have enough, try comma-separated parsing
  if (recommendations.length === 0) {
    const commaSeparated = text.split(',').map(title => title.trim());
    recommendations.push(...commaSeparated.slice(0, 8));
  }
  
  // Ensure we have exactly 8 recommendations
  return recommendations.slice(0, 8);
}