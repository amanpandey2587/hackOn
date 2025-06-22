// frontend/hooks/useRoulette.ts
import { useState } from 'react';

interface UserInput {
  mood?: string;
  genre?: string[];
  duration?: string;
  actor?: string;
  keywords?: string;
  streamingService?: string[];
}

export const useRoulette = () => {
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spinWheel = async (input: UserInput, mode: 'chaos' | 'user') => {
    setLoading(true);
    setError(null);
    setSelectedTitle(null);

    try {
      const response = await fetch('http://localhost:3001/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode, userId: 'user_abc123' }) // Replace with real user ID
      });

      const data = await response.json();

      if (!data.recommendations || data.recommendations.length === 0) {
        throw new Error('No recommendations received');
      }

      setTitles(data.recommendations);
      const randomIndex = Math.floor(Math.random() * data.recommendations.length);
      setSelectedTitle(data.recommendations[randomIndex]);
    } catch (err) {
      setError('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return {
    titles,
    selectedTitle,
    loading,
    error,
    spinWheel
  };
};
