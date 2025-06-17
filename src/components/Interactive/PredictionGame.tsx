import React, { useState } from 'react'

export default function PredictionGame({ predictions }: { predictions: string[] }) {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div>
      <h3 className="text-xl text-white font-semibold mb-2">🔮 Make a Prediction</h3>
      <div className="grid grid-cols-2 gap-3">
        {predictions.map((opt) => (
          <button
            key={opt}
            onClick={() => setPicked(opt)}
            className={`p-3 rounded-lg ${picked === opt ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
          >
            {opt}
          </button>
        ))}
      </div>
      {picked && <p className="mt-2 text-purple-400">You predicted: {picked}</p>}
    </div>
  )
}