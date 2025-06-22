import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

app.post('/api/generate-interactive', async (req: Request, res: Response) => {
  const { title, overview, genre, type } = req.body

  let specificPrompt = ''

  switch (type) {
    case 'quiz':
      specificPrompt = `You are a quiz master. Based on the movie/show titled "${title}" with genre "${genre}" and overview "${overview}", generate 2 multiple-choice quiz questions with 4 options and the correct answer. Format:
      {
        quiz: [{question: "...", options: ["..."], answer: "..."}]
      }`
      break

    case 'poll':
      specificPrompt = `Based on the movie/show titled "${title}" with genre "${genre}" and overview "${overview}", generate 1 fun or thought-provoking poll question with 4 options. Format:
      {
        poll: {question: "...", options: ["...", "...", "...", "..."]}
      }`
      break

    case 'prediction':
      specificPrompt = `Based on the movie/show titled "${title}" with genre "${genre}" and overview "${overview}", generate a prediction game with 4 possible future outcomes for the story. Format:
      {
        prediction: { options: ["...", "...", "...", "..."] }
      }`
      break

    default:
      specificPrompt = `You are a quiz master. Based on the movie/show title "${title}", genre "${genre}", and overview "${overview}":
1) Generate 2 multiple-choice quiz questions (question, 4 options, correct answer)
2) Generate 1 poll question with options
3) Generate 1 prediction scenario with options.

Return JSON like this:
{
  quiz: [{question, options: [...], answer}, ...],
  poll: {question, options: [...]},
  prediction: {options: [...]}
}`
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: specificPrompt }] }]
    })

    const text = result.response.text().replace(/```json|```/g, '').trim()
    const json = JSON.parse(text)
    res.json(json)
  } catch (err) {
    console.error('Gemini error:', err)
    res.status(500).send('Gemini AI generation failed')
  }
})

app.get('/', (_req, res) => {
  res.send('Gemini AI backend running 👋')
})

const PORT = 4001
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
})
