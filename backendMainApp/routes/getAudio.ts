const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
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

router.post('/getAudio', upload.single('audio'), async (req: any, res: any) => {
    try {
        const audioFile = req.file;
        
        if (!audioFile) {
            return res.json({
                success: false,
                message: "No audio file found"
            });
        }

        const timestamp = Date.now();
        const fileExtension = path.extname(audioFile.originalname) || '.audio';
        const fileName = `audio_${timestamp}_${audioFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, audioFile.buffer);

        console.log('Audio file received and saved:', {
            originalName: audioFile.originalname,
            savedAs: fileName,
            savedPath: filePath,
            mimeType: audioFile.mimetype,
            size: audioFile.size,
            bufferLength: audioFile.buffer.length
        });

        return res.json({
            success: true,
            message: "Audio file received and saved successfully",
            fileInfo: {
                originalName: audioFile.originalname,
                savedFileName: fileName,
                savedPath: filePath,
                mimeType: audioFile.mimetype,
                size: audioFile.size,
                sizeInKB: Math.round(audioFile.size / 1024)
            },
        });

    } catch (error) {
        console.error("Error received while getting the audio", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while processing the audio file",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/download/:filename', (req: any, res: any) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        res.sendFile(filePath);
        
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while downloading the file",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;