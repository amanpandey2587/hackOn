import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { requireAuth } from "@clerk/express";
import { MoodService } from "../services/moodService";

const router = express.Router();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("[INIT] Created uploads directory at:", uploadsDir);
}

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    console.log("[MULTER] Validating file:", {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });

    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      console.error(
        "[MULTER] File rejected - not an audio file:",
        file.mimetype
      );
      cb(new Error("Only audio files are allowed!"), false);
    }
  },
});

// Add requireAuth() middleware to protect the route
router.post(
  "/getAudio",
  requireAuth(),
  upload.single("audio"),
  async (req: any, res: any) => {
    const requestId = Date.now(); // For tracking this specific request in logs
    console.log(`[REQUEST-${requestId}] POST /getAudio initiated`);

    try {
      const audioFile = req.file;
      const userId = req.auth?.userId; // From Clerk authentication

      console.log(`[REQUEST-${requestId}] User authenticated:`, {
        userId,
        sessionId: req.auth?.sessionId,
      });

      if (!userId) {
        console.error(`[REQUEST-${requestId}] No user ID found in auth`);
        return res.status(401).json({
          success: false,
          message: "Unauthorized - no user ID found",
        });
      }

      if (!audioFile) {
        console.error(`[REQUEST-${requestId}] No audio file in request`);
        return res.status(400).json({
          success: false,
          message: "No audio file found",
        });
      }

      console.log(`[REQUEST-${requestId}] Audio file received:`, {
        originalName: audioFile.originalname,
        mimeType: audioFile.mimetype,
        size: `${(audioFile.size / 1024).toFixed(2)} KB`,
      });

      // Save the file temporarily
      const timestamp = Date.now();
      const fileExtension = ".wav"; // Ensure it's WAV for the model
      const fileName = `audio_${timestamp}_${userId}.wav`;
      const filePath = path.join(uploadsDir, fileName);

      console.log(`[REQUEST-${requestId}] Saving file to:`, filePath);
      fs.writeFileSync(filePath, audioFile.buffer);
      console.log(`[REQUEST-${requestId}] File saved successfully`);

      try {
        // Analyze mood using Python API
        console.log(`[REQUEST-${requestId}] Starting mood analysis...`);
        const moodAnalysis = await MoodService.analyzeAudioMood(filePath);
        console.log(
          `[REQUEST-${requestId}] Mood analysis completed:`,
          moodAnalysis
        );

        // Save mood to database
        console.log(`[REQUEST-${requestId}] Saving mood to database...`);
        const moodHistory = await MoodService.saveMoodForUser(
          userId,
          moodAnalysis
        );
        console.log(`[REQUEST-${requestId}] Mood saved to database`);

        // Clean up the temporary file
        fs.unlinkSync(filePath);
        console.log(`[REQUEST-${requestId}] Temporary file cleaned up`);

        console.log(`[REQUEST-${requestId}] Request completed successfully`);
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
          },
        });
      } catch (analysisError) {
        console.error(
          `[REQUEST-${requestId}] Error during mood analysis:`,
          analysisError
        );

        // Clean up file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[REQUEST-${requestId}] Cleaned up file after error`);
        }

        return res.status(500).json({
          success: false,
          message: "Error analyzing mood from audio",
          error:
            analysisError instanceof Error
              ? analysisError.message
              : "Unknown error",
        });
      }
    } catch (error) {
      console.error(`[REQUEST-${requestId}] Unexpected error:`, error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while processing the audio file",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get mood history for a user
router.get("/mood-history", requireAuth(), async (req: any, res: any) => {
  const requestId = Date.now();
  console.log(`[REQUEST-${requestId}] GET /mood-history initiated`);

  try {
    const userId = req.auth?.userId;
    const limit = parseInt(req.query.limit) || 50;

    console.log(`[REQUEST-${requestId}] Fetching mood history:`, {
      userId,
      limit,
    });

    const moodHistory = await MoodService.getUserMoodHistory(userId, limit);

    // console.log(`[REQUEST-${requestId}] Mood history fetched:`, {
    //   userId,
    //   recordsFound: moodHistory?.length || 0,
    // });

    return res.json({
      success: true,
      data: moodHistory,
    });
  } catch (error) {
    console.error(`[REQUEST-${requestId}] Error fetching mood history:`, error);
    return res.status(500).json({
      success: false,
      message: "Error fetching mood history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get mood statistics for a user
router.get("/mood-stats", requireAuth(), async (req: any, res: any) => {
  try {
    const userId = req.auth.userId;
    const moodHistory = await MoodService.getUserMoodHistory(userId);

    if (!moodHistory.aggregatedData) {
      return res.json({
        success: true,
        data: {
          hasData: false,
          message: "No mood data available yet",
        },
      });
    }

    return res.json({
      success: true,
      data: {
        hasData: true,
        stats: moodHistory.aggregatedData,
        totalMoods: moodHistory.moods.length,
      },
    });
  } catch (error) {
    console.error("Error fetching mood stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching mood statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const GEMINI_API_KEY = "AIzaSyBcPpCYJHla0P42ImAWTfqlKzW7mAu5UrA";

router.post("/gemini/movie-search", async (req: any, res: any) => {
  console.log("Etered the function in backend ");
  const { searchTerm, languageName } = req.body;

  const prompt = `
You are an expert entertainment database assistant. Help users find movies, TV shows, documentaries, and songs by providing accurate names and IMDB IDs.

User query: "${searchTerm}"
Search language: ${languageName}

Your tasks:
1. If the query contains spelling mistakes, correct them
2. If the query is not in English, translate it to English  
3. If the query is descriptive (like "romantic movie with a singer" or "bhai ka naam bahubali hota hai"), suggest specific titles
4. If the query is in Hinglish or mixed languages, understand and provide relevant results
5. Provide movie/show names with their IMDB IDs (only if you're confident about the ID)
6. Identify the content type (movie, tv, documentary, music)

Examples:
- "harri poter" → "Harry Potter and the Philosopher's Stone" (imdb: tt0241527)
- "ek romantic movie containing a singer" → "Aashiqui 2" (imdb: tt2364958), "Rockstar" (imdb: tt1829377)
- "bahubali movie" → "Baahubali: The Beginning" (imdb: tt2635980), "Baahubali 2: The Conclusion" (imdb: tt5095030)
- "funny korean show" → "Crash Landing on You", "What's Wrong with Secretary Kim"
- "avengers endgame" → "Avengers: Endgame" (imdb: tt4154796)

Respond ONLY in valid JSON format:
{
  "original_query": "${searchTerm}",
  "corrected_query": "corrected/translated query",
  "results": [
    {
      "title": "Movie/Show Title",
      "imdb_id": "tt1234567",
      "type": "movie",
      "year": 2019,
      "confidence": 0.95
    }
  ],
  "total_results": 3,
  "language_detected": "${languageName}",
  "query_type": "specific_title"
}

Important: 
- Only include IMDB IDs if you're 100% confident about them
- If no IMDB ID is available, omit the "imdb_id" field for that result
- Provide 3-5 most relevant results
- For TV shows, still try to provide IMDB IDs if available
- Set confidence level based on how sure you are about the match
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Data in the backend is", data);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      const cleanedText = text.replace(/```json\s*|\s*```/g, "").trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ status: 200, message: "Success", parsed });
        return;
      }
    }

    res.status(500).json({ error: "Invalid response from Gemini" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

export default router;
