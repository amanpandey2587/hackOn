import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { setupSocket } from "./socket";
import { connectDB } from "./db";
import partyRoutes from "./routes/parties";
import messageRoutes from "./routes/messages";
import userProfileRoutes from "./routes/UserProfile";
import watchHistoryRoutes from "./routes/WatchHistory";
import audioRoutes from "./routes/getAudio";
import transcriptRoutes from "./routes/transcript";
import moodHistoryRoutes from "./routes/moodHistory";
import { requireAuth } from "@clerk/express";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Logging middleware
app.use((req:any, res:any, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get("/api/test", (req:any, res:any) => {
  res.json({ message: "API is working" });
});

// Root route
app.get("/", (req:any, res:any) => {
  res.json({
    message: "Server is running",
    routes: ["/api/parties", "/api/messages", "/api/test"],
  });
});

// Debug route: all users
app.get("/api/debug/all-users", async (req:any, res:any) => {
  try {
    const MoodHistory = mongoose.model("MoodHistory");
    const WatchHistory = mongoose.model("WatchHistory");

    const allMoodUsers = await MoodHistory.distinct("userId");
    const allWatchUsers = await WatchHistory.distinct("userId");

    const sampleMood = await MoodHistory.findOne();
    const sampleWatch = await WatchHistory.findOne();

    res.json({
      moodHistoryUsers: allMoodUsers,
      watchHistoryUsers: allWatchUsers,
      totalMoodDocs: await MoodHistory.countDocuments(),
      totalWatchDocs: await WatchHistory.countDocuments(),
      sampleMood: sampleMood
        ? {
            userId: sampleMood.userId,
            moodsCount: sampleMood.moods?.length,
            id: sampleMood._id,
          }
        : null,
      sampleWatch: sampleWatch
        ? {
            userId: sampleWatch.userId,
            title: sampleWatch.title,
            id: sampleWatch._id,
          }
        : null,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Debug route: db info
app.get("/api/debug/db-info", async (req:any, res:any) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database not connected");
    }

    const dbName = db.databaseName;
    console.log("db name is", dbName);

    const collections = await db.listCollections().toArray();

    const { userId } = req.query;
    let userData = {};

    if (userId && typeof userId === "string") {
      const MoodHistory = mongoose.model("MoodHistory");
      const WatchHistory = mongoose.model("WatchHistory");

      const moodData = await MoodHistory.findOne({ userId });
      const watchData = await WatchHistory.find({ userId });

      userData = {
        moodHistoryFound: !!moodData,
        watchHistoryCount: watchData.length,
        moodId: moodData?._id,
        watchIds: watchData.map((w: any) => w._id),
      };
    }

    res.json({
      connected: mongoose.connection.readyState === 1,
      database: dbName,
      collections: collections.map((c) => c.name),
      userData,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const startServer = async () => {
  try {
    // Connect to DB
    await connectDB();
    console.log("✅ Database connected");

    // Setup socket.io
    setupSocket(io);
    console.log("✅ Socket.io configured");

    // Public routes
    app.use("/api/transcript", transcriptRoutes);
    app.use("/api/get-audio", audioRoutes);
    app.use("/api/mood-history", moodHistoryRoutes);
    app.use("/api/watch-history", watchHistoryRoutes);

    // Protected routes
    app.use("/api/user-profiles", requireAuth(), userProfileRoutes);

    // Other routes
    app.use("/api/parties", partyRoutes);
    app.use("/api/messages", messageRoutes);

    console.log("Registered routes:");
    app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        console.log(middleware.route.path);
      } else if (middleware.name === "router") {
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            const path = middleware.regexp.source
              .replace(/\\/g, "")
              .replace(/\^/, "")
              .replace(/\$.*/, "")
              .replace(/\?.*/, "");
            console.log(`${path}${handler.route.path}`);
          }
        });
      }
    });

    // Start server
    server.listen(4000, () => {
      console.log("✅ Server running on http://localhost:4000");
      console.log("✅ Available routes:");
      console.log("   GET  /");
      console.log("   GET  /api/test");
      console.log("   GET  /api/parties");
      console.log("   POST /api/parties");
      console.log("   *    /api/messages/*");
    });
  } catch (err) {
    const error = err as Error;
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
