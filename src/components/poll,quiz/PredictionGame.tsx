import React, { useState } from 'react'

export default function PredictionGame({ predictions }: { predictions: string[] }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(50)
  const [showConfidence, setShowConfidence] = useState(false)

  const handlePrediction = (prediction: string) => {
    setPicked(prediction)
    setShowConfidence(true)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-2xl animate-bounce">
          🔮
        </div>
        <h3 className="text-2xl font-bold text-white">Make Your Prediction</h3>
      </div>
      
      <p className="text-xl text-slate-200 mb-8 leading-relaxed">
        What do you think will happen at the end?
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => (
          <button
            key={prediction}
            onClick={() => handlePrediction(prediction)}
            className={`
              group relative p-6 rounded-xl font-medium text-left transition-all duration-300 overflow-hidden
              ${picked === prediction 
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-500/25 scale-105' 
                : 'bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-purple-600/50 hover:to-pink-600/50 hover:scale-105 hover:shadow-xl transform'
              }
            `}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{prediction}</span>
                {picked === prediction && (
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            
            {picked !== prediction && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
              </>
            )}
          </button>
        ))}
      </div>
      
      {showConfidence && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-xl">
          <label className="block text-white font-medium mb-4">
            How confident are you? ({confidence}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(236, 72, 153) ${confidence}%, rgb(71, 85, 105) ${confidence}%, rgb(71, 85, 105) 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>Not sure</span>
            <span>Very confident</span>
          </div>
        </div>
      )}
      
      {picked && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-xl">
          <p className="text-purple-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            Your prediction: <span className="font-bold text-white">"{picked}"</span>
          </p>
          {showConfidence && (
            <p className="text-slate-400 text-sm mt-1">
              Confidence level: {confidence}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}