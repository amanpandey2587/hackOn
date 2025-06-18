import express from "express";
import { Message } from "../models/Message";

const router = express.Router();

router.get("/:partyId", async (req, res) => {
  const { partyId } = req.params;
  try {
    const messages = await Message.find({ partyId }).sort({ timestamp: 1 }) 
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
