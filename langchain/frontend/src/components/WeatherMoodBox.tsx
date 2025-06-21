import React from 'react'

const WeatherMoodBox = () => {
  // This would eventually come from a global state or props
  const mood = 'happy'
  const weather = 'Clear'

  return (
    <div className="bg-gray-800 p-4 rounded shadow flex justify-between">
      <div>Current Mood: <span className="font-bold text-green-400">{mood}</span></div>
      <div>Weather: <span className="font-bold text-blue-400">{weather}</span></div>
    </div>
  )
}

export default WeatherMoodBox
