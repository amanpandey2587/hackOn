import { Request, Response } from 'express';
import { fetchRecommendations } from '../services/gemini.service';
import { buildPrompt } from '../services/promptBuilder';
import WatchHistory from '../models/WatchHistory';

export const getRecommendation = async (req: Request, res: Response) => {
  try {
    const { userId, input, mode } = req.body;

    const historyDocs = mode === 'chaos'
      ? []
      : await WatchHistory.find({ userId }).sort({ watchedAt: -1 }).limit(10);

    const safeHistory = historyDocs.map((item) => ({
      title: item.title || 'Unknown',
      genre: item.genre || [],
      rating: item.rating || 0,
      streamingService: item.streamingService || 'Unknown',
      releaseYear: item.releaseYear || 2000,
      watchPercentage: item.watchPercentage || 0,
      completed: item.completed ?? false
    }));

    const prompt = buildPrompt(mode, input, safeHistory);
    const recommendations = await fetchRecommendations(prompt);

    res.json({ recommendations });
  } catch (err) {
    console.error('❌ Error generating recommendation:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
