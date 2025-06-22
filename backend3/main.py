from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from recommender.mood_fetcher import get_user_mood
from recommender.weather_fetcher import get_weather
from recommender.history_fetcher import get_watch_history
from recommender.langchain_recommender import generate_recommendations
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommend")
async def recommend(user_id: str = Query(...), streaming_service: str = Query("All")):
    mood = get_user_mood(user_id)
    weather = get_weather()
    time = datetime.now().strftime("%H:%M %p")
    history_summary = get_watch_history(user_id, streaming_service)
    
    recommendations = generate_recommendations(
        mood=mood,
        history=history_summary,
        weather=weather,
        time=time,
        streaming_service=streaming_service
    )

    return {"recommendations": recommendations}
