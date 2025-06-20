import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { Clerk } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const clerk = Clerk({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function testWithClerkAuth() {
  try {
    console.log('Testing mood detection with Clerk authentication...\n');

    // Get the first user (or specify your test user ID)
    const users = await clerk.users.getUserList({ limit: 1 });
    if (users.length === 0) {
      console.error('No users found');
      return;
    }

    const testUser = users[0];
    const userId = testUser.id;
    console.log(`Using test user: ${testUser.emailAddresses[0]?.emailAddress} (${userId})`);

    // Create a test session token
    // This is a workaround - in production, tokens come from the frontend
    const testSessionClaims = {
      userId: userId,
      sessionId: 'test-session-' + Date.now(),
    };

    // For testing, we'll modify our approach
    // Instead of trying to get a token, we'll create a mock auth object
    console.log('\nTesting with mock authentication...\n');

    // Use one of the existing audio files
    const uploadsDir = path.join(__dirname, 'routes', 'uploads');
    const audioFile = 'audio_1750424107812_recording.wav';
    const testFile = path.join(uploadsDir, audioFile);

    console.log('Using audio file:', audioFile);

    // Since we can't easily generate valid Clerk tokens from backend,
    // let's create a test endpoint that accepts a user ID directly
    // OR temporarily modify the auth check for testing

    // Option 1: Create a test version of the endpoint
    await testDirectMoodAnalysis(userId, testFile);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testDirectMoodAnalysis(userId: string, audioFilePath: string) {
  console.log('Testing direct mood analysis...\n');

  // First, let's test the Python API directly
  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioFilePath));

  try {
    // Step 1: Analyze with Python API
    console.log('1. Analyzing mood with Python API...');
    const pythonResponse = await axios.post(
      'http://127.0.0.1:8000/analyze-emotion/',
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000,
      }
    );

    console.log('✅ Mood analysis result:', JSON.stringify(pythonResponse.data, null, 2));

    // Step 2: Save directly to MongoDB (bypass the API for testing)
    console.log('\n2. Saving to MongoDB...');
    await testDatabaseOperations(userId, pythonResponse.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function testDatabaseOperations(userId: string, moodData: any) {
  // Import your MongoDB models and service
  const { MoodService } = await import('./services/moodService');
  const { connectDB } = await import('./db');
  
  // Connect to database
  await connectDB();

  try {
    // Save mood for user
    const moodHistory = await MoodService.saveMoodForUser(userId, moodData);
    console.log('✅ Mood saved to database');
    console.log('Aggregated data:', moodHistory.aggregatedMoodData);

    // Get mood history
    const history = await MoodService.getUserMoodHistory(userId, 5);
    console.log('\n✅ Mood history retrieved:');
    console.log(`Total moods: ${history.moods.length}`);
    console.log('Latest moods:', history.moods.slice(-3).map(m => ({
      emotion: m.emotion,
      confidence: m.confidence,
      timestamp: m.timestamp
    })));

  } catch (error) {
    console.error('Database error:', error);
  }
}

// Alternative: Create a simple HTTP test with a mock token
async function testWithMockToken() {
  console.log('\n\nAlternative: Testing with mock endpoint...\n');

  // You'll need to temporarily add this endpoint to your getAudio.ts:
  /*
  router.post('/test-mood/:userId', upload.single('audio'), async (req: any, res: any) => {
    // Mock auth for testing
    req.auth = { userId: req.params.userId };
    // Then call your regular handler logic
  });
  */

  const testUserId = 'user_2pIZgJNJQM5vAZTpH6UjIDnV6CL'; // Replace with your user ID
  const uploadsDir = path.join(__dirname, 'routes', 'uploads');
  const audioFile = 'audio_1750424107812_recording.wav';
  const testFile = path.join(uploadsDir, audioFile);

  const formData = new FormData();
  formData.append('audio', fs.createReadStream(testFile), 'test.wav');

  try {
    const response = await axios.post(
      `http://localhost:4000/api/get-audio/test-mood/${testUserId}`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000,
      }
    );

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error:', error.response?.data || error.message);
    }
  }
}

// Run the tests
testWithClerkAuth();