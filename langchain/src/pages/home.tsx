import React, { useState } from 'react'
import SearchBar from '../components/SearchBar'
import WeatherMoodBox from '../components/WeatherMoodBox'
import RecommendationCard from '../components/RecommendationCard'

const Home = () => {
  const [recommendations, setRecommendations] = useState([])

  const fetchRecommendations = async (userId: string, service: string) => {
    const res = await fetch(`http://localhost:8000/recommend?user_id=${userId}&streaming_service=${service}`)
    const data = await res.json()
    setRecommendations(data.recommendations || [])
  }

  return (
    <div className="p-6 space-y-6">
      <SearchBar onSearch={fetchRecommendations} />
      <WeatherMoodBox />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} {...rec} />
        ))}
      </div>
    </div>
  )
}

export default Home
