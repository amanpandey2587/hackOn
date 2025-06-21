import mongoose from 'mongoose';
import MoodHistory from './models/MoodHistory';
import WatchHistory from './models/WatchHistory';
import dotenv from 'dotenv';

dotenv.config();

async function seedTestData(userId: string) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB successfully');
    
    // // Check what database we're connected to
    // console.log('Database name:', mongoose.connection.db.databaseName);
    
    // First, let's check if data already exists
    const existingMood = await MoodHistory.findOne({ userId });
    const existingWatch = await WatchHistory.findOne({ userId });
    
    console.log('Existing mood history:', existingMood ? 'Found' : 'Not found');
    console.log('Existing watch history:', existingWatch ? 'Found' : 'Not found');
    
    // Clear existing data
    await MoodHistory.deleteMany({ userId });
    await WatchHistory.deleteMany({ userId });
    console.log('Cleared existing data for user:', userId);
    
    // Create mood history
    const moodHistory = new MoodHistory({
      userId,
      moods: [
        {
          emotion: 'Neutral',
          confidence: 0.85,
          timestamp: new Date(Date.now() - 3600000),
          probabilities: {
            Neutral: 0.85,
            Anger: 0.05,
            Happiness: 0.08,
            Sadness: 0.02
          }
        },
        {
          emotion: 'Happiness',
          confidence: 0.92,
          timestamp: new Date(Date.now() - 7200000),
          probabilities: {
            Neutral: 0.05,
            Anger: 0.01,
            Happiness: 0.92,
            Sadness: 0.02
          }
        }
      ]
    });
    
    await moodHistory.updateAggregatedData();
    const savedMood = await moodHistory.save();
    console.log('Mood history created with ID:', savedMood._id);
    
    // Create watch history
    const watchHistories = [
      {
        id: `${userId}_123456`,
        userId,
        contentId: '123456',
        contentType: 'movie',
        title: 'Inception',
        watchedAt: new Date(Date.now() - 86400000),
        watchDuration: 8400,
        totalDuration: 8880,
        watchPercentage: 94.6,
        completed: true,
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        rating: 8.8,
        releaseYear: 2010,
        seasonNumber: 0,
        episodeNumber: 0,
        streamingService: 'Netflix'
      },
      {
        id: `${userId}_789012`,
        userId,
        contentId: '789012',
        contentType: 'movie',
        title: 'The Dark Knight',
        watchedAt: new Date(Date.now() - 172800000),
        watchDuration: 9000,
        totalDuration: 9120,
        watchPercentage: 98.7,
        completed: true,
        genre: ['Action', 'Crime', 'Drama'],
        rating: 9.0,
        releaseYear: 2008,
        seasonNumber: 0,
        episodeNumber: 0,
        streamingService: 'Netflix'
      }
    ];
    
    const savedWatch = await WatchHistory.insertMany(watchHistories);
    console.log('Watch history created, number of documents:', savedWatch.length);
    
    // Verify the data was saved
    const verifyMood = await MoodHistory.findOne({ userId });
    const verifyWatch = await WatchHistory.find({ userId });
    
    console.log('\n=== VERIFICATION ===');
    console.log('Mood history in DB:', verifyMood ? 'YES' : 'NO');
    console.log('Watch history count in DB:', verifyWatch.length);
    
    // Show all user IDs in the database
    const allMoodUsers = await MoodHistory.distinct('userId');
    const allWatchUsers = await WatchHistory.distinct('userId');
    
    console.log('\n=== ALL USERS IN DATABASE ===');
    console.log('Users with mood history:', allMoodUsers);
    console.log('Users with watch history:', allWatchUsers);
    
    console.log('\nTest data seeded successfully for user:', userId);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

// Run the script
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID as argument');
  console.error('Usage: npx ts-node seedTestData.ts <userId>');
  process.exit(1);
}

console.log('Starting seed for user ID:', userId);
seedTestData(userId);