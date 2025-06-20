import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import MoodHistory, { MoodHistoryDocument } from '../models/MoodHistory';
import UserContext from '../models/UserContext';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

export interface MoodAnalysisResult {
  emotion: string;
  label: string;
  confidence: number;
  index: number;
  probabilities: {
    Neutral: number;
    Anger: number;
    Happiness: number;
    Sadness: number;
  };
}

export class MoodService {
  static async analyzeAudioMood(audioFilePath: string): Promise<MoodAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));

      const response = await axios.post(
        `${PYTHON_API_URL}/analyze-emotion/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error analyzing mood:', error);
      throw new Error('Failed to analyze audio mood');
    }
  }

  static async saveMoodForUser(userId: string, moodData: MoodAnalysisResult) {
    try {
      // Find or create mood history for user
      let moodHistory = await MoodHistory.findOne({ userId }) as MoodHistoryDocument | null;
      
      if (!moodHistory) {
        moodHistory = new MoodHistory({ userId, moods: [] }) as MoodHistoryDocument;
      }

      // Add the new mood
      await moodHistory.addMood({
        emotion: moodData.emotion,
        confidence: moodData.confidence,
        probabilities: moodData.probabilities,
      });

      // Update UserContext with mood preferences
      await this.updateUserMoodPreferences(userId, moodHistory);

      return moodHistory;
    } catch (error) {
      console.error('Error saving mood:', error);
      throw new Error('Failed to save mood data');
    }
  }

  static async updateUserMoodPreferences(userId: string, moodHistory: MoodHistoryDocument) {
    try {
      const userContext = await UserContext.findOne({ userId });
      
      if (userContext) {
        // Update mood preferences with aggregated data
        userContext.moodPreferences = {
          dominantMood: moodHistory.aggregatedMoodData.dominantMood,
          moodDistribution: moodHistory.aggregatedMoodData.moodDistribution,
          recentMoodTrend: this.calculateMoodTrend(moodHistory.moods),
          lastAnalyzed: new Date(),
        };
        
        userContext.lastUpdated = new Date();
        await userContext.save();
      }
    } catch (error) {
      console.error('Error updating user mood preferences:', error);
    }
  }

  static calculateMoodTrend(moods: any[]) {
    if (moods.length < 2) return 'stable';

    const recentMoods = moods.slice(-10); // Last 10 moods
    const moodValues: Record<string, number> = {
      'Happiness': 2,
      'Neutral': 0,
      'Sadness': -1,
      'Anger': -2,
    };

    let trend = 0;
    for (let i = 1; i < recentMoods.length; i++) {
      const currentValue = moodValues[recentMoods[i].emotion];
      const previousValue = moodValues[recentMoods[i - 1].emotion];
      trend += currentValue - previousValue;
    }

    if (trend > 3) return 'improving';
    if (trend < -3) return 'declining';
    return 'stable';
  }

  static async getUserMoodHistory(userId: string, limit: number = 50) {
    try {
      const moodHistory = await MoodHistory.findOne({ userId }) as MoodHistoryDocument | null;
      
      if (!moodHistory) {
        return {
          moods: [],
          aggregatedData: null,
        };
      }

      return {
        moods: moodHistory.moods.slice(-limit),
        aggregatedData: moodHistory.aggregatedMoodData,
      };
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw new Error('Failed to fetch mood history');
    }
  }
}