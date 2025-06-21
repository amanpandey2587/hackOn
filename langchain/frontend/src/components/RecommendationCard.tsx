import React, { useState } from "react";
import axios from "axios";

interface Recommendation {
  title: string;
  genre: string;
  platform: string;
  reason: string;
}

const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/recommend", {
        params: {
          user_id: "user_2yh036LYXpjTfvFhJ2zLjWmmgXn",
          streaming_service: "All"
        }
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl mb-6 font-bold">🔥 Fire TV Recommender</h1>
      <button
        onClick={fetchRecommendations}
        className="bg-red-600 px-6 py-3 rounded hover:bg-red-700 mb-6"
      >
        {loading ? "Loading..." : "Get Recommendations"}
      </button>

      <div className="space-y-4 max-w-2xl w-full">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{rec.title}</h2>
            <p className="text-sm text-gray-400">{rec.genre} | {rec.platform}</p>
            <p className="mt-2 text-sm">{rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
