import express from "express"
import { Party } from "../models/Party"

const router = express.Router()

router.get("/", async (_, res) => {
  const parties = await Party.find()
  res.json(parties)
})

router.post("/", async (req, res) => {
  const { title, isPrivate } = req.body
  const party = await Party.create({ title, isPrivate, members: [] })
  res.status(201).json(party)
})

export default router
