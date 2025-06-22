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
    return `Give me exactly 8 random movie or show titles across any genre or language. Be diverse and creative. 

Format your response as a simple numbered list:
1. Title 1
2. Title 2
3. Title 3
4. Title 4
5. Title 5
6. Title 6
7. Title 7
8. Title 8

Only return the titles in this exact format, no additional text or explanations.`;
  }

  let prompt = `You are a smart content recommendation system. I need exactly 8 personalized movie or show suggestions based on the following user preferences:\n`;

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

  prompt += `\nFormat your response as a simple numbered list:
1. Title 1
2. Title 2
3. Title 3
4. Title 4
5. Title 5
6. Title 6
7. Title 7
8. Title 8

Only return the titles in this exact format, no additional text or explanations.`;

  return prompt;
};