import { Request, Response } from 'express';
import axios from 'axios';

interface TranscriptChunk {
  start: number;
  end: number;
  text: string;
}

interface TranscriptHeader {
  start: number;
  end: number;
  title: string;
}

export class TranscriptController {
  static async getVideoChapters(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
      }

      console.log(`Fetching chapters for video ID: ${videoId}`);

      // Call your Python backend for transcript processing
      const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';
      
      console.log(`Calling Python backend at: ${pythonBackendUrl}/api/generate-chapters`);
      
      try {
        const response = await axios.post(`${pythonBackendUrl}/api/generate-chapters`, {
          video_id: videoId
        });

        console.log('Python backend response:', response.data);

        return res.json({
          success: true,
          data: response.data
        });
      } catch (pythonError: any) {
        console.error('Python backend error:', pythonError.response?.data || pythonError.message);
        
        // If it's an axios error with response data, pass through the Python error
        if (pythonError.response?.data?.detail) {
          return res.status(pythonError.response.status).json({ 
            error: 'Python backend error',
            details: pythonError.response.data.detail
          });
        }
        
        throw pythonError;
      }
    } catch (error) {
      console.error('Error generating chapters:', error);
      return res.status(500).json({ 
        error: 'Failed to generate chapters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}