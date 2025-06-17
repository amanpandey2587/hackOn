import React, { useState } from 'react'

export default function LivePoll({ question, options }: { question: string; options: string[] }) {
  const [voted, setVoted] = useState<string | null>(null)
  return (
    <div>
      <h3 className="text-xl text-white font-semibold mb-2">📊 {question}</h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setVoted(opt)}
            className={`p-3 rounded-lg ${voted === opt ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
          >
            {opt}
          </button>
        ))}
      </div>
      {voted && <p className="mt-2 text-green-400">You voted for: {voted}</p>}
    </div>
  )
}
