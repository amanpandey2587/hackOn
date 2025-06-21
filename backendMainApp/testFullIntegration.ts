import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

async function testFullIntegration() {
  try {
    console.log('Testing full mood detection integration...\n');
    
    // Use one of the existing audio files
    const uploadsDir = path.join(__dirname, 'routes', 'uploads');
    const audioFile = 'audio_1750424107812_recording.wav';
    const testFile = path.join(uploadsDir, audioFile);
    
    console.log('Using audio file:', audioFile);
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(testFile), 'test-recording.wav');
    
    // Call Node.js API which will forward to Python and save to MongoDB
    console.log('Calling Node.js API at http://localhost:4000/api/get-audio/getAudio\n');
    
    const response = await axios.post(
      'http://localhost:4000/api/get-audio/getAudio',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000,
      }
    );
    
    console.log('✅ Full integration successful!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test fetching mood history
    console.log('\n\nTesting mood history endpoint...');
    const historyResponse = await axios.get(
      'http://localhost:4000/api/get-audio/mood-history?limit=5'
    );
    
    console.log('Mood History:', JSON.stringify(historyResponse.data, null, 2));
    
    // Test mood statistics
    console.log('\n\nTesting mood statistics endpoint...');
    const statsResponse = await axios.get(
      'http://localhost:4000/api/get-audio/mood-stats'
    );
    
    console.log('Mood Stats:', JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('\n❌ Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
      }
    } else {
      console.error('\n❌ Error:', error);
    }
  }
}

testFullIntegration();