import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios, { AxiosError } from 'axios';

async function testPythonAPI() {
  console.log('Testing Python API connection...');
  
  try {
    // First, let's check the FastAPI docs endpoint
    console.log('\n1. Checking if FastAPI docs are accessible...');
    try {
      await axios.get('http://127.0.0.1:8000/docs', {
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });
      console.log('✅ FastAPI docs endpoint is accessible at http://127.0.0.1:8000/docs');
    } catch (e) {
      // Docs might redirect, that's okay
      console.log('ℹ️  Docs endpoint responded (might be a redirect)');
    }
    
    // Now let's test the audio analysis endpoint
    console.log('\n2. Testing audio analysis endpoint...');
    
    // List available audio files
    const uploadsDir = path.join(__dirname, 'routes', 'uploads');
    console.log('Looking for audio files in:', uploadsDir);
    
    if (!fs.existsSync(uploadsDir)) {
      console.error('❌ Uploads directory does not exist!');
      console.log('Current directory:', __dirname);
      
      // Try to create a test audio file
      console.log('\nCreating a minimal test WAV file...');
      const testDir = path.join(__dirname, 'test-audio');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      // For now, let's just check if the endpoint exists
      console.log('\nChecking if analyze-emotion endpoint exists...');
      const testFormData = new FormData();
      
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/analyze-emotion/',
          testFormData,
          {
            headers: testFormData.getHeaders(),
          }
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 422) {
          console.log('✅ Endpoint exists! (Got expected validation error for missing file)');
          console.log('Validation details:', err.response.data.detail);
          return;
        }
        throw err;
      }
      return;
    }
    
    const files = fs.readdirSync(uploadsDir);
    const audioFiles = files.filter(f => f.endsWith('.wav'));
    
    if (audioFiles.length === 0) {
      console.error('❌ No .wav files found in uploads directory');
      console.log('Files found:', files);
      
      // Still test if endpoint exists
      console.log('\nTesting if endpoint exists without file...');
      const emptyForm = new FormData();
      try {
        await axios.post('http://127.0.0.1:8000/analyze-emotion/', emptyForm, {
          headers: emptyForm.getHeaders(),
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 422) {
          console.log('✅ Endpoint exists! (Got expected validation error)');
        }
      }
      return;
    }
    
    console.log('Found audio files:', audioFiles);
    
    // Use the first audio file
    const testFile = path.join(uploadsDir, audioFiles[0]);
    const fileStats = fs.statSync(testFile);
    console.log('\nUsing test file:', audioFiles[0]);
    console.log('File size:', (fileStats.size / 1024).toFixed(2), 'KB');
    
    // Create form data
    console.log('\nPreparing to upload to Python API...');
    const formData = new FormData();
    const fileStream = fs.createReadStream(testFile);
    formData.append('file', fileStream, audioFiles[0]);
    
    // Upload to Python API
    console.log('Uploading to http://127.0.0.1:8000/analyze-emotion/');
    
    const response = await axios.post(
      'http://127.0.0.1:8000/analyze-emotion/',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000, // 60 seconds timeout
      }
    );
    
    console.log('\n✅ Success! Emotion analysis result:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Test the full integration through Node.js
    console.log('\n3. Testing full integration through Node.js API...');
    console.log('(This will fail with auth error, but that\'s expected)');
    
    const nodeFormData = new FormData();
    nodeFormData.append('audio', fs.createReadStream(testFile), 'test.wav');
    
    try {
      await axios.post(
        'http://localhost:4000/api/get-audio/getAudio',
        nodeFormData,
        {
          headers: nodeFormData.getHeaders(),
        }
      );
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        console.log('✅ Node.js endpoint is reachable (got expected auth error)');
      } else {
        throw err;
      }
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('\n❌ Axios Error:', error.message);
      console.error('Error code:', error.code);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused - is the Python server running on port 8000?');
      }
    } else {
      console.error('\n❌ Error:', error);
    }
  }
}

testPythonAPI();