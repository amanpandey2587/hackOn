import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config()

const app = express()
app.use(express.json(), cors())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/generate-interactive', async (req, res) => {
  const { title, overview, genre } = req.body
  try {
    const prompt = `You are a quiz master. Based on the movie/show title "${title}", genre "${genre}", and overview:
1) Generate 2 multiple-choice quiz questions (question, 4 options, correct answer)
2) Generate 1 poll question with options
3) Generate 1 prediction scenario with options.

Return JSON:
{
  quiz: [{question, options: [...], answer}, ...],
  poll: {question, options: [...]},
  prediction: {scenario: "What happens next?", options: [...]}
}`

    const resp = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })

    const payload = JSON.parse(resp.data.choices[0].message?.content)
    res.json(payload)
  } catch (err) {
    console.error(err)
    res.status(500).send('AI generation failed')
  }
})

app.listen(4000, () => console.log('Running on port 4000'))

app.get('/', (req, res) => {
  res.send('AI backend is running 👋');
});