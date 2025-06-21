// import express from 'express';
const express = require("express");
import {
  getAllWatchHistory,
  createWatchHistory,
  getWatchHistoryById,
  deleteWatchHistory,
} from "../controllers/WatchHistory";
import { requireAuth } from "@clerk/express";
import WatchHistory from "../models/WatchHistory";

const router = express.Router();

// Public route for recommendations (no auth required)
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    console.log('Fetching public watch history for user:', userId);

    const watchHistory = await WatchHistory.find({ userId })
      .sort({ watchedAt: -1 })
      .limit(Number(limit));
    
    console.log('Watch history entries found:', watchHistory.length);

    res.json({
      watchHistory,
      count: watchHistory.length,
    });
  } catch (error) {
    console.error("Error fetching watch history:", error);
    res.status(500).json({ error: "Failed to fetch watch history" });
  }
});

// Protected routes (require auth)
router.get("/getWatchHistory", requireAuth(), getAllWatchHistory);
router.post("/createWatchHistory", requireAuth(), createWatchHistory);
router.get("/getWatchHistoryById/:id", requireAuth(), getWatchHistoryById);
router.delete("/getWatchHistoryById/:id", requireAuth(), deleteWatchHistory);

export default router;