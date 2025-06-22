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
  const [spinning, setSpinning] = useState(false);

  const spinWheel = async (
    input: UserInput,
    mode: 'chaos' | 'user',
    userId: string
  ) => {
    setLoading(true);
    setError(null);
    setSelectedTitle(null);
    setTitles([]);
    
    try {
      const response = await fetch('http://localhost:3001/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode, userId, format: 'array' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.recommendations) {
        throw new Error('No recommendations received');
      }

      let recommendations: string[] = [];

      if (Array.isArray(data.recommendations)) {
        recommendations = data.recommendations;
      } else if (typeof data.recommendations === 'string') {
        recommendations = data.recommendations
          .split(',')
          .map((title: string) => title.trim())
          .filter(Boolean);
      } else {
        throw new Error('Invalid recommendations format received');
      }

      if (recommendations.length === 0) {
        throw new Error('No valid recommendations found');
      }

      // Ensure we have exactly 8 recommendations
      recommendations = recommendations.slice(0, 8);
      
      while (recommendations.length < 8) {
        recommendations.push(`Recommended Title ${recommendations.length + 1}`);
      }

      console.log('📽️ Loaded recommendations:', recommendations);
      setTitles(recommendations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(errorMessage);
      console.error('Fetch error:', err);
      
      // Set fallback titles in case of error
      const fallbackTitles = [
        'The Shawshank Redemption',
        'Inception',
        'The Dark Knight',
        'Pulp Fiction',
        'Forrest Gump',
        'The Matrix',
        'Goodfellas',
        'The Godfather'
      ];
      setTitles(fallbackTitles);
    } finally {
      setLoading(false);
    }
  };

  const selectTitle = () => {
    if (titles.length > 0 && !spinning) {
      console.log('🎲 Starting wheel spin...');
      setSpinning(true);
      setSelectedTitle(null);
      
      // First, immediately select a random title
      const randomIndex = Math.floor(Math.random() * titles.length);
      const chosenTitle = titles[randomIndex];
      
      console.log(`🎯 Pre-selected title: ${chosenTitle} (index: ${randomIndex})`);
      
      // Set the selected title immediately so the wheel can calculate its rotation
      setSelectedTitle(chosenTitle);
      
      // After the spinning animation completes, stop the spinning state
      setTimeout(() => {
        console.log('🏁 Wheel spin completed');
        setSpinning(false);
      }, 4000); // Match the CSS transition duration
    }
  };

  const resetSelection = () => {
    console.log('🔄 Resetting selection');
    setSelectedTitle(null);
    setSpinning(false);
  };

  const clearTitles = () => {
    console.log('🗑️ Clearing all data');
    setTitles([]);
    setSelectedTitle(null);
    setSpinning(false);
    setError(null);
  };

  return {
    titles,
    selectedTitle,
    setSelectedTitle,
    loading,
    error,
    spinning,
    spinWheel,
    selectTitle,
    resetSelection,
    clearTitles
  };
};