import React from 'react'
import InteractiveContainer from './components/InteractiveContainer'

function App() {
  const mockData = {
    title: 'Inception',
    overview: 'A skilled thief uses dream-sharing technology to plant an idea into the mind of a CEO.',
    genre: 'Sci-Fi'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-12 text-center">🎬 Interactive Experience</h1>
        <InteractiveContainer
          title={mockData.title}
          overview={mockData.overview}
          genre={mockData.genre}
        />
      </div>
    </div>
  )
}

export default App