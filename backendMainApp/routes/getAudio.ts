import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@clerk/express';
import { MoodService } from '../services/moodService';

const router = express.Router();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

// Main endpoint for audio analysis and mood detection
// Temporarily change this line:
// router.post('/getAudio', requireAuth(), upload.single('audio'), async (req: any, res: any) => {
// to this
router.post('/getAudio', upload.single('audio'), async (req: any, res: any) => {   
    if (!req.auth) {
        req.auth = { userId: 'test-user-123' };
    }
    // ... rest of your code
    try {
        const audioFile = req.file;
        const userId = req.auth.userId; // From Clerk authentication
        
        if (!audioFile) {
            return res.status(400).json({
                success: false,
                message: "No audio file found"
            });
        }

        // Save the file temporarily
        const timestamp = Date.now();
        const fileExtension = '.wav'; // Ensure it's WAV for the model
        const fileName = `audio_${timestamp}_${userId}.wav`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, audioFile.buffer);

        console.log('Audio file received:', {
            userId,
            savedAs: fileName,
            size: audioFile.size,
        });

        try {
            // Analyze mood using Python API
            const moodAnalysis = await MoodService.analyzeAudioMood(filePath);
            
            // Save mood to database
            const moodHistory = await MoodService.saveMoodForUser(userId, moodAnalysis);
            
            // Clean up the temporary file
            fs.unlinkSync(filePath);

            return res.json({
                success: true,
                message: "Audio analyzed and mood detected successfully",
                mood: {
                    current: moodAnalysis,
                    history: moodHistory.aggregatedMoodData,
                },
                fileInfo: {
                    originalName: audioFile.originalname,
                    mimeType: audioFile.mimetype,
                    size: audioFile.size,
                }
            });

        } catch (analysisError) {
            // Clean up file on error
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            console.error("Error analyzing mood:", analysisError);
            return res.status(500).json({
                success: false,
                message: "Error analyzing mood from audio",
                error: analysisError instanceof Error ? analysisError.message : 'Unknown error'
            });
        }

    } catch (error) {
        console.error("Error processing audio:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while processing the audio file",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get mood history for a user
router.get('/mood-history', requireAuth(), async (req: any, res: any) => {
    try {
        const userId = req.auth.userId;
        const limit = parseInt(req.query.limit) || 50;
        
        const moodHistory = await MoodService.getUserMoodHistory(userId, limit);
        
        return res.json({
            success: true,
            data: moodHistory,
        });
        
    } catch (error) {
        console.error("Error fetching mood history:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching mood history",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get mood statistics for a user
router.get('/mood-stats', requireAuth(), async (req: any, res: any) => {
    try {
        const userId = req.auth.userId;
        const moodHistory = await MoodService.getUserMoodHistory(userId);
        
        if (!moodHistory.aggregatedData) {
            return res.json({
                success: true,
                data: {
                    hasData: false,
                    message: "No mood data available yet"
                }
            });
        }
        
        return res.json({
            success: true,
            data: {
                hasData: true,
                stats: moodHistory.aggregatedData,
                totalMoods: moodHistory.moods.length,
            }
        });
        
    } catch (error) {
        console.error("Error fetching mood stats:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching mood statistics",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;