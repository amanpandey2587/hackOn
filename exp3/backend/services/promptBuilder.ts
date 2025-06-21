// backend/services/promptBuilder.ts

interface UserInput {
  mood?: string;
  genre?: string[];
  duration?: string;
  actor?: string;
  keywords?: string;
  streamingService?: string[];
}

interface WatchHistoryItem {
  title: string;
  genre: string[];
  rating: number;
  streamingService: string;
  releaseYear: number;
  watchPercentage: number;
  completed: boolean;
}

export const buildPrompt = (
  mode: 'chaos' | 'user',
  input: UserInput,
  watchHistory: WatchHistoryItem[]
): string => {
  if (mode === 'chaos') {
    return `Give me a random list of 8 movie or show titles across any genre or language. Be diverse and creative. Only return titles.`;
  }

  let prompt = `I want 8 personalized movie or show recommendations.\n`;

  if (input.mood) prompt += `- Mood: ${input.mood}\n`;
  if (input.genre?.length) prompt += `- Genre: ${input.genre.join(', ')}\n`;
  if (input.duration) prompt += `- Duration preference: ${input.duration}\n`;
  if (input.actor) prompt += `- Prefer actors like: ${input.actor}\n`;
  if (input.keywords) prompt += `- Keywords: ${input.keywords}\n`;
  if (input.streamingService?.length)
    prompt += `- Available on: ${input.streamingService.join(', ')}\n`;

  if (watchHistory.length) {
    const historyText = watchHistory
      .slice(0, 5)
      .map(
        (item) =>
          `- ${item.title} (${item.genre.join(', ')}), ${
            item.completed ? 'completed' : 'incomplete'
          }, rating: ${item.rating}/10`
      )
      .join('\n');
    prompt += `\nUser previously watched:\n${historyText}\n`;
  }

  prompt += `\nOnly return a plain list of 8 titles. No extra explanation.`;

  return prompt;
};
