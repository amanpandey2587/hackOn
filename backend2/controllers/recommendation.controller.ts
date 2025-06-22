// backend/controllers/recommendation.controller.ts
//import { Request, Response } from 'express';
import { fetchRecommendations } from '../services/gemini.service';
import { buildPrompt } from '../services/promptBuilder';
import WatchHistory from '../models/WatchHistory';

import { Request, Response, NextFunction } from 'express';

export const getRecommendation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, input, mode, format = 'array' } = req.body;

    if (!userId || !mode) {
      res.status(400).json({ error: 'Missing required fields: userId and mode' });
      return;
    }

    const historyDocs =
      mode === 'chaos'
        ? []
        : await WatchHistory.find({ userId }).sort({ watchedAt: -1 }).limit(10);

    const safeHistory = historyDocs.map((item) => ({
      title: item.title || 'Unknown',
      genre: item.genre || [],
      rating: item.rating || 0,
      streamingService: item.streamingService || 'Unknown',
      releaseYear: item.releaseYear || 2000,
      watchPercentage: item.watchPercentage || 0,
      completed: item.completed ?? false,
    }));

    const prompt = buildPrompt(mode, input || {}, safeHistory);
    const recommendationsArray = await fetchRecommendations(prompt);

    const response =
      format === 'string'
        ? { recommendations: recommendationsArray.join(', ') }
        : { recommendations: recommendationsArray };

    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Error generating recommendation:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};