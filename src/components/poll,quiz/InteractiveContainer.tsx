import React, { useState } from 'react'
import LivePoll from './LivePoll'
import QuizGame from './QuizGame'
import PredictionGame from './PredictionGame'
import { BarChart3, Brain, TrendingUp, Users, Award, Target } from 'lucide-react'

interface Props {
  title: string
  overview: string
  genre: string
}

export default function InteractiveContainer({ title, overview, genre }: Props) {
  const [quizData, setQuizData] = useState<any[]>([])
  const [pollData, setPollData] = useState<any>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeGame, setActiveGame] = useState<'home' | 'poll' | 'quiz' | 'prediction'>('home')

  const mockQuiz = [
    {
      question: 'What is the dream-sharing device called in Inception?',
      options: ['PASIV', 'Tesseract', 'Totem', 'Dreamlink'],
      answer: 'PASIV'
    },
    {
      question: 'Who plays the lead role in Inception?',
      options: ['Leonardo DiCaprio', 'Tom Hardy', 'Brad Pitt', 'Matt Damon'],
      answer: 'Leonardo DiCaprio'
    }
  ]

  const mockPoll = {
    question: 'Would you use dream-sharing if it existed?',
    options: ['Absolutely!', 'Maybe', 'Nope', 'Not sure']
  }

  const mockPrediction = {
    options: ['The top keeps spinning', 'The top falls', 'Cobb wakes up', 'It cuts to black']
  }

  const fetchGameData = async (game: 'poll' | 'quiz' | 'prediction') => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/generate-interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, overview, genre })
      })
      const json = await res.json()
      if (game === 'poll') setPollData(json.poll || mockPoll)
      if (game === 'quiz') setQuizData(json.quiz || mockQuiz)
      if (game === 'prediction') setPredictionData(json.prediction || mockPrediction)
    } catch (err) {
      console.error(err)
      // Fallback to mock data
      if (game === 'poll') setPollData(mockPoll)
      if (game === 'quiz') setQuizData(mockQuiz)
      if (game === 'prediction') setPredictionData(mockPrediction)
    } finally {
      setLoading(false)
      setActiveGame(game)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl animate-pulse">Loading GameHub...</div>
      </div>
    )
  }

  if (activeGame === 'poll' && pollData) {
    return (
      <div>
        <button onClick={() => setActiveGame('home')} className="text-white mb-4">
          ← Back to GameHub
        </button>
        <LivePoll question={pollData.question} options={pollData.options} />
      </div>
    )
  }

  if (activeGame === 'quiz' && quizData.length > 0) {
    return (
      <div>
        <button onClick={() => setActiveGame('home')} className="text-white mb-4">
          ← Back to GameHub
        </button>
        <QuizGame quizData={quizData} />
      </div>
    )
  }

  if (activeGame === 'prediction' && predictionData) {
    return (
      <div>
        <button onClick={() => setActiveGame('home')} className="text-white mb-4">
          ← Back to GameHub
        </button>
        <PredictionGame predictions={predictionData.options} />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
          GameHub
        </h1>
        <p className="text-xl text-gray-300">
          Engage, compete, and have fun with our interactive games platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gray-800 border border-gray-700 rounded-xl flex flex-col justify-between"
          onClick={() => pollData ? setActiveGame('poll') : fetchGameData('poll')}
        >
          <div className="text-center flex-grow">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Poll Game</h3>
            <p className="text-gray-300 mb-6">
              Create and participate in engaging polls. Vote on trending topics and see real-time results.
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Community Voting</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Live Results</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium">
            Start Polling
          </div>
        </div>

        <div
          className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gray-800 border border-gray-700 rounded-xl flex flex-col justify-between"
          onClick={() => quizData.length > 0 ? setActiveGame('quiz') : fetchGameData('quiz')}
        >
          <div className="text-center flex-grow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Quiz Game</h3>
            <p className="text-gray-300 mb-6">
              Test your knowledge with challenging quizzes. Compete with others and climb the leaderboard.
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>Brain Training</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>Leaderboard</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-medium">
            Take Quiz
          </div>
        </div>

        <div
          className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gray-800 border border-gray-700 rounded-xl flex flex-col justify-between"
          onClick={() => predictionData ? setActiveGame('prediction') : fetchGameData('prediction')}
        >
          <div className="text-center flex-grow">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Prediction Game</h3>
            <p className="text-gray-300 mb-6">
              Make predictions about future events. Earn points for accurate forecasts and strategic thinking.
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>Future Events</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Point System</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg font-medium">
            Make Predictions
          </div>
        </div>
      </div>
    </div>
  )
}
