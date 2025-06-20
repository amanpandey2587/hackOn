import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

async function testMoodDetection() {
  try {
    // Create a test WAV file path
    const testAudioPath = path.join(__dirname, 'routes/uploads/audio_1750424107812_recording.wav');
    
    // Check if file exists
    if (!fs.existsSync(testAudioPath)) {
      console.error('Test audio file not found. Please provide a WAV file.');
      return;
    }

    // Test 1: Direct Python API test
    console.log('Testing Python API directly...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testAudioPath));

    const pythonResponse = await axios.post(
      'http://localhost:8000/analyze-emotion/',
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    console.log('Python API Response:', JSON.stringify(pythonResponse.data, null, 2));

    // Test 2: Node.js endpoint (without auth for testing)
    // Note: You'll need to temporarily disable auth or provide a token
    console.log('\nTesting Node.js endpoint...');
    
    // For testing without auth, temporarily modify your route to skip requireAuth()
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMoodDetection();