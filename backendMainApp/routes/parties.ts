import express from "express";
import bcrypt from "bcryptjs"; // Install: npm install bcryptjs @types/bcryptjs
import { Party } from "../models/Party";

const router = express.Router();

const ALLOWED_TAGS = ["action", "adventure", "comedy", "drama", "thriller", "horror", "romance", "sci-fi", "fantasy", "mystery", "crime", "documentary", "musical", "animation", "war", "western", "historical", "family", "biography", "supernatural", "psychological", "noir", "slasher", "movie", "tv-series", "web-series", "anime", "short-film", "mini-series", "docuseries", "reality-show", "talk-show", "stand-up", "live-performance", "anthology", "ova", "ona", "special", "sports", "school", "slice-of-life", "superhero", "dystopian", "post-apocalyptic", "survival", "cyberpunk", "space", "time-travel", "aliens", "vampires", "zombies", "mythology", "crime-investigation", "political", "legal", "medical", "gaming", "idol", "music", "cooking", "travel", "friendship", "coming-of-age"]

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

// GET /parties/:id/tags – Return current tags for a party
router.get("/:id/tags", async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ error: "Party not found" });

    res.json({ tags: party.tags ?? [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// POST /parties/:id/tags – Add tags (must be allowed, no duplicates)
router.post("/:id/tags", async (req, res) => {
  try {
    const { tags } = req.body; // tags should be an array
    if (!Array.isArray(tags)) return res.status(400).json({ error: "tags must be an array" });

    // Validate all tags are allowed and not duplicates
    const uniqueTags = Array.from(new Set(tags));
    const invalidTags = uniqueTags.filter(tag => !ALLOWED_TAGS.includes(tag));
    if (invalidTags.length) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }

    // Add to existing tags (no duplicates)
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ error: "Party not found" });

    const newTagsSet = new Set([...(party.tags ?? []), ...uniqueTags]);
    party.tags = Array.from(newTagsSet);
    await party.save();

    res.json({ tags: party.tags });
  } catch (error) {
    res.status(500).json({ error: "Failed to add tags" });
  }
});

// DELETE /parties/:id/tags – Remove tags
router.delete("/:id/tags", async (req, res) => {
  try {
    const { tags } = req.body; // tags should be an array
    if (!Array.isArray(tags)) return res.status(400).json({ error: "tags must be an array" });

    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ error: "Party not found" });

    party.tags = (party.tags ?? []).filter(tag => !tags.includes(tag));
    await party.save();

    res.json({ tags: party.tags });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove tags" });
  }
});

// Optionally, expose the allowed tags
router.get("/allowed-tags", (req, res) => {
  res.json({ tags: ALLOWED_TAGS });
});

export default router;