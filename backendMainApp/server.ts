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
import audioRoutes from "./routes/getAudio"
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
    app.use("/api/parties", partyRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/user-profiles", requireAuth(), userProfileRoutes);
    app.use("/api/watch-history", requireAuth(), watchHistoryRoutes);
    app.use("/api/get-audio",audioRoutes)
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
