import React, { useState } from 'react'

export default function QuizGame({ quizData }: { quizData: any[] }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [timerActive, setTimerActive] = useState(true)

  React.useEffect(() => {
    if (!timerActive || selected) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer('')
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [current, selected, timerActive])

  const handleAnswer = (option: string) => {
    if (selected) return
    
    setSelected(option)
    setTimerActive(false)
    
    if (option === quizData[current].answer) {
      setScore(score + 1)
    }
    
    setTimeout(() => {
      setSelected(null)
      setTimerActive(true)
      setTimeLeft(15)
      
      if (current + 1 < quizData.length) {
        setCurrent(current + 1)
      } else {
        setShowResult(true)
      }
    }, 2000)
  }

  const getScoreColor = () => {
    const percentage = (score / quizData.length) * 100
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getScoreMessage = () => {
    const percentage = (score / quizData.length) * 100
    if (percentage >= 80) return 'Excellent! 🎉'
    if (percentage >= 60) return 'Good job! 👏'
    if (percentage >= 40) return 'Not bad! 👍'
    return 'Keep trying! 💪'
  }

  if (showResult) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">
            🎯
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h3>
          <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent mb-4`}>
            {score}/{quizData.length}
          </div>
          <p className="text-xl text-slate-300 mb-6">{getScoreMessage()}</p>
          
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Accuracy</span>
              <span className="text-white font-bold">{Math.round((score / quizData.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor()} transition-all duration-1000 ease-out`}
                style={{ width: `${(score / quizData.length) * 100}%` }}
              />
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const currentQ = quizData[current]
  const progress = ((current + 1) / quizData.length) * 100

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl animate-pulse">
            🎯
          </div>
          <h3 className="text-2xl font-bold text-white">Quiz Challenge</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
            {timeLeft}s
          </div>
          <div className="text-slate-400 text-sm">
            {current + 1}/{quizData.length}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-8">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Timer Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgb(71, 85, 105)"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={timeLeft <= 5 ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)"}
              strokeWidth="2"
              strokeDasharray={`${(timeLeft / 15) * 100}, 100`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>
      </div>
      
      <div className="mb-8">
        <p className="text-xl text-white leading-relaxed">{currentQ.question}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQ.options.map((option: string, index: number) => {
          let buttonClass = 'bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500 hover:scale-105 transform'
          
          if (selected) {
            if (option === currentQ.answer) {
              buttonClass = 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
            } else if (selected === option) {
              buttonClass = 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
            } else {
              buttonClass = 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!selected}
              className={`
                p-6 rounded-xl font-medium text-left transition-all duration-300 relative overflow-hidden
                ${buttonClass}
              `}
            >
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-lg">{option}</span>
                {selected && option === currentQ.answer && (
                  <span className="text-2xl">✓</span>
                )}
                {selected && selected === option && option !== currentQ.answer && (
                  <span className="text-2xl">✗</span>
                )}
              </div>
              
              {!selected && (
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              )}
            </button>
          )
        })}
      </div>
      
      <div className="mt-6 flex justify-between items-center text-sm text-slate-400">
        <span>Question {current + 1} of {quizData.length}</span>
        <span>Score: {score}/{current + (selected ? 1 : 0)}</span>
      </div>
    </div>
  )
}