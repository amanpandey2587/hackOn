import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Webhook } from "svix";
import dotenv from "dotenv";
import { setupSocket } from "./socket";
import { connectDB } from "./db";
import partyRoutes from "./routes/parties";
import { Server } from "socket.io";
import http from "http";
import messageRoutes from "./routes/messages";
import userProfileRoutes from "./routes/UserProfile"; // 👈 renamed for clarity
import { requireAuth } from "@clerk/express";
import watchHistoryRoutes from "./routes/WatchHistory";
import audioRoutes from "./routes/getAudio";
import transcriptRoutes from "./routes/transcript";
import moodHistoryRoutes from "./routes/moodHistory";
dotenv.config();

const app = express();

// Set up middleware FIRST, before creating the server
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Root route for debugging
app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
    routes: ["/api/parties", "/api/messages", "/api/test"],
  });
});

// Add this to server.ts
app.get('/api/debug/all-users', async (req, res) => {
  try {
    const MoodHistory = mongoose.model('MoodHistory');
    const WatchHistory = mongoose.model('WatchHistory');
    
    const allMoodUsers = await MoodHistory.distinct('userId');
    const allWatchUsers = await WatchHistory.distinct('userId');
    
    // Get sample data
    const sampleMood = await MoodHistory.findOne();
    const sampleWatch = await WatchHistory.findOne();
    
    res.json({
      moodHistoryUsers: allMoodUsers,
      watchHistoryUsers: allWatchUsers,
      totalMoodDocs: await MoodHistory.countDocuments(),
      totalWatchDocs: await WatchHistory.countDocuments(),
      sampleMood: sampleMood ? {
        userId: sampleMood.userId,
        moodsCount: sampleMood.moods?.length,
        id: sampleMood._id
      } : null,
      sampleWatch: sampleWatch ? {
        userId: sampleWatch.userId,
        title: sampleWatch.title,
        id: sampleWatch._id
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/db-info', async (req, res) => {
  try {
    const dbName = mongoose.connection.db.databaseName;
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Check specific user data
    const { userId } = req.query;
    let userData = {};
    
    if (userId) {
      const MoodHistory = mongoose.model('MoodHistory');
      const WatchHistory = mongoose.model('WatchHistory');
      
      const moodData = await MoodHistory.findOne({ userId });
      const watchData = await WatchHistory.find({ userId });
      
      userData = {
        moodHistoryFound: !!moodData,
        watchHistoryCount: watchData.length,
        moodId: moodData?._id,
        watchIds: watchData.map(w => w._id)
      };
    }
    
    res.json({
      connected: mongoose.connection.readyState === 1,
      database: dbName,
      collections: collections.map(c => c.name),
      userData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NOW create the HTTP server with the configured app
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const startServer = async () => {
  try {
    // Connect to DB first
    await connectDB();
    console.log("✅ Database connected");

    // Set up socket.io
    setupSocket(io);
    console.log("✅ Socket.io configured");

    app.use(express.json());
    // Set up routes
    // In server.ts, update the routes section:

    // Public routes (no auth required)
    app.use("/api/transcript", transcriptRoutes);
    app.use("/api/get-audio", audioRoutes);
    app.use("/api/mood-history", moodHistoryRoutes); // Move this to public
    app.use("/api/watch-history", watchHistoryRoutes); // This now has both public and protected routes

    // Protected routes (require auth)
    app.use("/api/user-profiles", requireAuth(), userProfileRoutes);

    // Other routes
    app.use("/api/parties", partyRoutes);
    app.use("/api/messages", messageRoutes);

    // Start the server
    server.listen(4000, () => {
      console.log("✅ Server running on http://localhost:4000");
      console.log("✅ Available routes:");
      console.log("   GET  /");
      console.log("   GET  /api/test");
      console.log("   GET  /api/parties");
      console.log("   POST /api/parties");
      console.log("   *    /api/messages/*");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
