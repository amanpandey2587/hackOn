import express from "express";
import bcrypt from "bcryptjs"; // Install: npm install bcryptjs @types/bcryptjs
import { Party } from "../models/Party";

const router = express.Router();

// Get all parties (hide password field)
router.get("/", async (req, res) => {
  try {
    const parties = await Party.find().select("-password"); // Exclude password
    res.json(parties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parties" });
  }
});

// Create a new party
router.post("/", async (req, res) => {
  try {
    const { title, isPrivate, password, userId, username } = req.body;
    
    // Check if party name already exists
    const existingParty = await Party.findOne({ title });
    if (existingParty) {
      return res.status(400).json({ error: "A party with this name already exists" });
    }
    
    // Hash password if private party
    let hashedPassword;
    if (isPrivate && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    const party = await Party.create({ 
      title, 
      isPrivate, 
      password: hashedPassword,
      members: [{
        userId: userId || "anonymous",
        username: username || "Anonymous User"
      }],
      createdBy: {
        userId: userId || "anonymous",
        username: username || "Anonymous User"
      }
    });
    
    // Return party without password
    const partyResponse = party.toObject();
    delete partyResponse.password;
    
    res.status(201).json(partyResponse);
  } catch (error: any) {
    if (error.code === 11000) { // MongoDB duplicate key error
      res.status(400).json({ error: "A party with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create party" });
    }
  }
});

// Join a party
router.post("/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username, password } = req.body;
    
    const party = await Party.findById(id);
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }
    
    // Check password for private parties
    if (party.isPrivate && party.password) {
      if (!password) {
        return res.status(401).json({ error: "Password required for private party" });
      }
      
      const isValidPassword = await bcrypt.compare(password, party.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }
    
    // Check if user already joined
    const alreadyJoined = party.members.some((m: any) => m.userId === userId);
    if (alreadyJoined) {
      return res.status(400).json({ error: "Already joined this party" });
    }
    
    // Add user to party
    party.members.push({
      userId: userId || "anonymous",
      username: username || "Anonymous User",
      joinedAt: new Date()
    });
    
    await party.save();
    
    // Return party without password
    const partyResponse = party.toObject();
    delete partyResponse.password;
    
    res.json(partyResponse);
  } catch (error) {
    res.status(500).json({ error: "Failed to join party" });
  }
});

router.post("/:id/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const party = await Party.findByIdAndUpdate(
      id,
      { $pull: { members: { userId: userId } } },
      { new: true }
    ).select("-password"); // Exclude password from response
    
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }
    
    res.json(party);
  } catch (error) {
    res.status(500).json({ error: "Failed to leave party" });
  }
});

export default router;