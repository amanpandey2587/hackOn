import React, { useState, useEffect } from 'react'
import LivePoll from './LivePoll'
import QuizGame from './QuizGame'
import PredictionGame from './PredictionGame'
import { BarChart3, Brain, TrendingUp, Users, Award, Target, ArrowLeft, Film, X } from 'lucide-react'

interface Props {
  title: string
  overview?: string
  genre?: string | string[]
  isOpen: boolean
  onClose: () => void
}

interface MovieDetails {
  overview: string
  genre: string[]
}

export default function InteractiveContainer({ title, overview, genre, isOpen, onClose }: Props) {
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
      if (!overview && title && isOpen) {
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

    if (isOpen) {
      fetchMovieDetails()
    }
  }, [title, overview, processedGenre, isOpen])

  // Reset to home when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveGame('home')
    }
  }, [isOpen])

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
      const res = await fetch('http://localhost:4001/api/generate-interactive', {
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

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full h-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {activeGame !== 'home' ? (
              <button 
                onClick={() => setActiveGame('home')} 
                className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to GameHub
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Film className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  GameHub
                </h1>
              </div>
            )}
          </div>

          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold text-white">
              {activeGame === 'home' ? `Interactive Games for "${title}"` : 
               activeGame === 'poll' ? 'Live Poll' :
               activeGame === 'quiz' ? 'Quiz Challenge' :
               'Prediction Game'}
            </h2>
            {activeGame === 'home' && movieDetails.overview && (
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto truncate">
                {movieDetails.overview}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {fetchingDetails ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
                <div className="text-lg">Loading movie details...</div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
                <div className="text-lg">Loading GameHub...</div>
              </div>
            </div>
          ) : activeGame === 'poll' && pollData ? (
            <div className="h-full overflow-auto p-6">
              <LivePoll question={pollData.question} options={pollData.options} />
            </div>
          ) : activeGame === 'quiz' && quizData.length > 0 ? (
            <div className="h-full overflow-auto p-6">
              <QuizGame quizData={quizData} />
            </div>
          ) : activeGame === 'prediction' && predictionData ? (
            <div className="h-full overflow-auto p-6">
              <PredictionGame predictions={predictionData.options} />
            </div>
          ) : (
            // Home Screen
            <div className="h-full overflow-auto p-6">
              <div className="max-w-6xl mx-auto">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
                    <Film className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Welcome to GameHub
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Dive deeper into "{title}" with interactive games, polls, and predictions. 
                    Test your knowledge, share your opinions, and compete with other viewers!
                  </p>
                </div>

                {/* Game Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Poll Game Card */}
                  <div
                    className="group p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-purple-500/50 rounded-xl flex flex-col justify-between backdrop-blur-sm hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-pink-900/20"
                    onClick={() => pollData ? setActiveGame('poll') : fetchGameData('poll')}
                  >
                    <div className="text-center flex-grow">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                        Poll Game
                      </h3>
                      <p className="text-gray-300 text-base mb-6 leading-relaxed">
                        Vote on questions about the movie and see what others think. 
                        Join the community discussion and discover different perspectives.
                      </p>
                      <div className="flex justify-center gap-4 text-sm text-gray-400 mb-6">
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                          <Users className="w-4 h-4" />
                          <span>Community</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                          <span>Live Results</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg text-center font-semibold group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      Start Polling
                    </div>
                  </div>

                  {/* Quiz Game Card */}
                  <div
                    className="group p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-blue-500/50 rounded-xl flex flex-col justify-between backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-900/20 hover:to-cyan-900/20"
                    onClick={() => quizData.length > 0 ? setActiveGame('quiz') : fetchGameData('quiz')}
                  >
                    <div className="text-center flex-grow">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                        Quiz Game
                      </h3>
                      <p className="text-gray-300 text-base mb-6 leading-relaxed">
                        Test your knowledge about the movie with challenging questions. 
                        See how well you understood the plot, characters, and details.
                      </p>
                      <div className="flex justify-center gap-4 text-sm text-gray-400 mb-6">
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                          <Brain className="w-4 h-4" />
                          <span>Knowledge</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                          <Award className="w-4 h-4" />
                          <span>Scoring</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg text-center font-semibold group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      Take Quiz
                    </div>
                  </div>

                  {/* Prediction Game Card */}
                  <div
                    className="group p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-indigo-500/50 rounded-xl flex flex-col justify-between backdrop-blur-sm hover:bg-gradient-to-br hover:from-indigo-900/20 hover:to-purple-900/20"
                    onClick={() => predictionData ? setActiveGame('prediction') : fetchGameData('prediction')}
                  >
                    <div className="text-center flex-grow">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                        Prediction Game
                      </h3>
                      <p className="text-gray-300 text-base mb-6 leading-relaxed">
                        Predict what happens next and compete with other viewers. 
                        Use your intuition and movie knowledge to make the best guesses.
                      </p>
                      <div className="flex justify-center gap-4 text-sm text-gray-400 mb-6">
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                          <Target className="w-4 h-4" />
                          <span>Predictions</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                          <span>Points</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg text-center font-semibold group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      Make Predictions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}