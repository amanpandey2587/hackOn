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
import { requireAuth } from '@clerk/express';
import watchHistoryRoutes from "./routes/WatchHistory"
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const startServer = async () => {
  await connectDB(); // ✅ Wait for DB to connect
  setupSocket(io);

  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));

  app.use(express.json());

  // Mount your API routes
  app.use("/api/parties", partyRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/user-profiles",requireAuth(), userProfileRoutes); // 👈 Add this line
  app.use("/api/watch-history",requireAuth(),watchHistoryRoutes);
  server.listen(4000, () =>
    console.log("Server running on http://localhost:4000")
  );
};

startServer();
