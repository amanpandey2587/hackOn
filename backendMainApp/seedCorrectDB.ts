// backendMainApp/seedCorrectDB.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models after dotenv
import MoodHistory from './models/MoodHistory';
import WatchHistory from './models/WatchHistory';

async function seedTestData(userId: string) {
  try {
    // Make sure we're connecting to the watchparty database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/watchparty';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected successfully');
    
    // Wait for connection to be ready and check database name
    if (mongoose.connection.db) {
      console.log('Database name:', mongoose.connection.db.databaseName);
    }
    
    // Clear any existing data for this user
    const deletedMood = await MoodHistory.deleteMany({ userId });
    const deletedWatch = await WatchHistory.deleteMany({ userId });
    console.log('Cleared existing data:', { 
      moodDeleted: deletedMood.deletedCount, 
      watchDeleted: deletedWatch.deletedCount 
    });
    
    // Create mood history
    const moodHistory = new MoodHistory({
      userId,
      moods: [
        {
          emotion: 'Happiness',
          confidence: 0.92,
          timestamp: new Date(),
          probabilities: {
            Neutral: 0.05,
            Anger: 0.01,
            Happiness: 0.92,
            Sadness: 0.02
          }
        },
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
        }
      ]
    });
    
    // Manually set aggregated data since updateAggregatedData might not work in script
    moodHistory.aggregatedMoodData = {
      dominantMood: 'Happiness',
      moodDistribution: {
        'Happiness': 50,
        'Neutral': 50,
        'Anger': 0,
        'Sadness': 0
      } as any, // Type assertion for Map type
      averageConfidence: 0.885,
      lastUpdated: new Date()
    };
    
    await moodHistory.save();
    console.log('Mood history saved successfully');
    
    // Create watch history entries
    const watchEntries = [
      {
        id: `${userId}_inception`,
        userId,
        contentId: '123456',
        contentType: 'movie' as const,
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
        id: `${userId}_dark_knight`,
        userId,
        contentId: '789012',
        contentType: 'movie' as const,
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
      },
      {
        id: `${userId}_interstellar`,
        userId,
        contentId: '345678',
        contentType: 'movie' as const,
        title: 'Interstellar',
        watchedAt: new Date(Date.now() - 259200000), // 3 days ago
        watchDuration: 10000,
        totalDuration: 10440,
        watchPercentage: 95.8,
        completed: true,
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        rating: 8.6,
        releaseYear: 2014,
        seasonNumber: 0,
        episodeNumber: 0,
        streamingService: 'Netflix'
      }
    ];
    
    await WatchHistory.insertMany(watchEntries);
    console.log('Watch history saved successfully');
    
    // Verify the data
    const verifyMood = await MoodHistory.findOne({ userId });
    const verifyWatch = await WatchHistory.find({ userId });
    
    console.log('\n=== Verification ===');
    console.log('Mood history found:', !!verifyMood);
    console.log('Mood entries:', verifyMood?.moods?.length || 0);
    console.log('Aggregated data exists:', !!verifyMood?.aggregatedMoodData);
    if (verifyMood?.aggregatedMoodData) {
      console.log('Dominant mood:', verifyMood.aggregatedMoodData.dominantMood);
    }
    console.log('Watch history entries:', verifyWatch.length);
    verifyWatch.forEach(w => {
      console.log(`- ${w.title} (${w.releaseYear})`);
    });
    
    // Show all users in database for reference
    console.log('\n=== All Users in Database ===');
    const allMoodUsers = await MoodHistory.distinct('userId');
    const allWatchUsers = await WatchHistory.distinct('userId');
    console.log('Users with mood history:', allMoodUsers);
    console.log('Users with watch history:', allWatchUsers);
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nData seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Get user ID from command line or use default
const userId = process.argv[2] || 'user_2yiZSxPPhLT1BmF3beJVBQXxV5u';
console.log('Seeding data for user:', userId);

seedTestData(userId).then(() => process.exit(0));