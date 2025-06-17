import React, { useState } from 'react'

export default function QuizGame({ quizData }: { quizData: any[] }) {
  return (
    <div>
      <h3 className="text-xl text-white font-semibold mb-4">🎯 Quiz Time</h3>
      {quizData.map((q, idx) => (
        <div key={idx} className="mb-4">
          <p className="text-white mb-2">{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt: string, i: number) => (
              <button
                key={i}
                className="p-2 bg-gray-700 text-white hover:bg-gray-600 rounded"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
