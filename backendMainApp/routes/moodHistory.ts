import express from 'express';
import MoodHistory from '../models/MoodHistory';
import { MoodService } from '../services/moodService';

const router = express.Router();

// Public route - no auth required for recommendations
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching mood history for user:', userId);
    
    const moodData = await MoodService.getUserMoodHistory(userId);
    
    const moodHistory = await MoodHistory.findOne({ userId });
    const moodTrend = moodHistory ? 
      MoodService.calculateMoodTrend(moodHistory.moods) : 'stable';
    
    const response = {
      ...moodData,
      moodTrend,
      aggregatedData: moodData.aggregatedData // Make sure this is included
    };
    
    console.log('Mood history response:', {
      userId,
      hasMoods: moodData.moods.length > 0,
      hasAggregatedData: !!moodData.aggregatedData
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

export default router;