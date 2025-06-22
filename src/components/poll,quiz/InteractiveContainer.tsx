import React, { useState, useEffect } from 'react'
import LivePoll from './LivePoll'
import QuizGame from './QuizGame'
import PredictionGame from './PredictionGame'
import { BarChart3, Brain, TrendingUp, Users, Award, Target, ArrowLeft, Film } from 'lucide-react'

interface Props {
  title: string
  overview?: string
  genre?: string | string[]
}

interface MovieDetails {
  overview: string
  genre: string[]
}

export default function InteractiveContainer({ title, overview, genre }: Props) {
  const [quizData, setQuizData] = useState<any[]>([])
  const [pollData, setPollData] = useState<any>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeGame, setActiveGame] = useState<'home' | 'poll' | 'quiz' | 'prediction'>('home')
  const [movieDetails, setMovieDetails] = useState<MovieDetails>({ overview: '', genre: [] })
  const [fetchingDetails, setFetchingDetails] = useState(false)

  const processedGenre = React.useMemo(() => {
    if (Array.isArray(genre)) {
      return genre
    }
    return genre ? [genre] : []
  }, [genre])

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!overview && title) {
        setFetchingDetails(true)
        try {
          const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=cb427cd4`)
          const data = await response.json()
          console.log("Interactive container frontend data")
          if (data.Response === 'True') {
            setMovieDetails({
              overview: data.Plot || 'No overview available',
              genre: data.Genre ? data.Genre.split(', ') : processedGenre
            })
          } else {
            setMovieDetails({
              overview: 'No overview available',
              genre: processedGenre
            })
          }
        } catch (error) {
          console.error('Error fetching movie details:', error)
          setMovieDetails({
            overview: 'No overview available',
            genre: processedGenre
          })
        } finally {
          setFetchingDetails(false)
        }
      } else {
        setMovieDetails({
          overview: overview || 'No overview available',
          genre: processedGenre
        })
      }
    }

    fetchMovieDetails()
  }, [title, overview, processedGenre])

  const mockQuiz = [
    {
      question: `What genre best describes "${title}"?`,
      options: ['Action', 'Drama', 'Comedy', 'Thriller'],
      answer: movieDetails.genre[0] || 'Drama'
    },
    {
      question: `Which element is most important in "${title}"?`,
      options: ['Plot', 'Characters', 'Visual Effects', 'Music'],
      answer: 'Plot'
    }
  ]

  const mockPoll = {
    question: `How would you rate "${title}"?`,
    options: ['Excellent', 'Good', 'Average', 'Poor']
  }

  const mockPrediction = {
    question: `What do you think happens next in "${title}"?`,
    options: ['Happy ending', 'Plot twist', 'Cliffhanger', 'Unexpected conclusion']
  }

  const fetchGameData = async (game: 'poll' | 'quiz' | 'prediction') => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/generate-interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          overview: movieDetails.overview, 
          genre: movieDetails.genre 
        })
      })
      const json = await res.json()
      if (game === 'poll') setPollData(json.poll || mockPoll)
      if (game === 'quiz') setQuizData(json.quiz || mockQuiz)
      if (game === 'prediction') setPredictionData(json.prediction || mockPrediction)
    } catch (err) {
      console.error(err)
      if (game === 'poll') setPollData(mockPoll)
      if (game === 'quiz') setQuizData(mockQuiz)
      if (game === 'prediction') setPredictionData(mockPrediction)
    } finally {
      setLoading(false)
      setActiveGame(game)
    }
  }

  if (fetchingDetails) {
    return (
      <div className="flex items-center justify-center py-8 mx-auto">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
          <div className="text-sm">Loading movie details...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent mx-auto mb-2"></div>
          <div className="text-sm">Loading GameHub...</div>
        </div>
      </div>
    )
  }

  if (activeGame === 'poll' && pollData) {
    return (
      <div className="w-full">
        <button 
          onClick={() => setActiveGame('home')} 
          className="flex items-center gap-2 text-white hover:text-purple-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to GameHub
        </button>
        <LivePoll question={pollData.question} options={pollData.options} />
      </div>
    )
  }

  if (activeGame === 'quiz' && quizData.length > 0) {
    return (
      <div className="w-full">
        <button 
          onClick={() => setActiveGame('home')} 
          className="flex items-center gap-2 text-white hover:text-purple-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to GameHub
        </button>
        <QuizGame quizData={quizData} />
      </div>
    )
  }

  if (activeGame === 'prediction' && predictionData) {
    return (
      <div className="w-full">
        <button 
          onClick={() => setActiveGame('home')} 
          className="flex items-center gap-2 text-white hover:text-purple-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to GameHub
        </button>
        <PredictionGame predictions={predictionData.options} />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Film className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            GameHub
          </h2>
        </div>
        <p className="text-sm text-gray-300">
          Interactive games for "{title}"
        </p>
        {movieDetails.overview && (
          <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto line-clamp-2">
            {movieDetails.overview}
          </p>
        )}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gray-800/80 border border-gray-700 rounded-lg flex flex-col justify-between group"
          onClick={() => pollData ? setActiveGame('poll') : fetchGameData('poll')}
        >
          <div className="text-center flex-grow">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Poll Game</h3>
            <p className="text-gray-300 text-sm mb-3">
              Vote on questions about the movie and see what others think.
            </p>
            <div className="flex justify-center gap-3 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Community</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Live Results</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded text-center font-medium text-sm group-hover:shadow-lg transition-shadow">
            Start Polling
          </div>
        </div>

        <div
          className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gray-800/80 border border-gray-700 rounded-lg flex flex-col justify-between group"
          onClick={() => quizData.length > 0 ? setActiveGame('quiz') : fetchGameData('quiz')}
        >
          <div className="text-center flex-grow">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Quiz Game</h3>
            <p className="text-gray-300 text-sm mb-3">
              Test your knowledge about the movie with challenging questions.
            </p>
            <div className="flex justify-center gap-3 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span>Knowledge</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Scoring</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded text-center font-medium text-sm group-hover:shadow-lg transition-shadow">
            Take Quiz
          </div>
        </div>

        <div
          className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gray-800/80 border border-gray-700 rounded-lg flex flex-col justify-between group"
          onClick={() => predictionData ? setActiveGame('prediction') : fetchGameData('prediction')}
        >
          <div className="text-center flex-grow">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Prediction Game</h3>
            <p className="text-gray-300 text-sm mb-3">
              Predict what happens next and compete with other viewers.
            </p>
            <div className="flex justify-center gap-3 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Predictions</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Points</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded text-center font-medium text-sm group-hover:shadow-lg transition-shadow">
            Make Predictions
          </div>
        </div>
      </div>

     
    </div>
  )
}