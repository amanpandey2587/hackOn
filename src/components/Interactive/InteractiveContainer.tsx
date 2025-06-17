import React, { useState, useEffect } from 'react'
import LivePoll from './LivePoll'
import QuizGame from './QuizGame'
import PredictionGame from './PredictionGame'

interface Props {
  title: string
  overview: string
  genre: string
}

export default function InteractiveContainer({ title, overview, genre }: Props) {
  const [quizData, setQuizData] = useState<any[]>([])
  const [pollData, setPollData] = useState<any>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:4000/api/generate-interactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, overview, genre })
        })
        const json = await res.json()
        setQuizData(json.quiz)
        setPollData(json.poll)
        setPredictionData(json.prediction)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [title, overview, genre])

  if (loading) return <div className="text-white">Generating content...</div>

  return (
    <div className="space-y-8 p-6">
      {pollData && <LivePoll question={pollData.question} options={pollData.options} />}
      {quizData.length > 0 && <QuizGame quizData={quizData} />}
      {predictionData && <PredictionGame predictions={predictionData.options} />}
    </div>
  )
}
