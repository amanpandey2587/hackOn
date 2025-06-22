from custom_interface import CustomEncoderWav2vec2Classifier
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
import os
import json
import uuid
import shutil
import torch
from typing import List
from dotenv import load_dotenv
from datetime import datetime
import httpx
from langchain.tools import tool
from langchain.agents import initialize_agent, AgentType
import httpx


# Load environment variables
load_dotenv()

# Your existing imports for emotion recognition

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = 10


class SearchQuery(BaseModel):
    query: str
    reason: str
    priority: int


class RecommendationResponse(BaseModel):
    search_queries: List[SearchQuery]
    context: dict
    generated_at: str


class VideoChapterRequest(BaseModel):
    video_id: str


class TranscriptHeader(BaseModel):
    start: float
    end: float
    title: str


class ChaptersResponse(BaseModel):
    chapters: List[TranscriptHeader]


def clean_transcript(raw_transcript):
    cleaned = []
    for entry in raw_transcript:
        start = round(entry["start"], 2)
        end = round(entry["start"] + entry["duration"], 2)
        text = entry["text"].strip()
        if text:
            cleaned.append({
                "start": start,
                "end": end,
                "text": text
            })
    return cleaned


def chunk_transcript(cleaned_transcript, chunk_size=500, chunk_overlap=50):
    full_text = " ".join([entry["text"] for entry in cleaned_transcript])

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    chunks = splitter.split_text(full_text)

    # Map character index to timestamp ranges
    full_char_index = 0
    index_map = []
    for entry in cleaned_transcript:
        start_idx = full_char_index
        end_idx = full_char_index + len(entry["text"]) + 1
        index_map.append((start_idx, end_idx, entry["start"], entry["end"]))
        full_char_index = end_idx

    # Find approximate start/end for each chunk
    chunked_output = []
    current_pointer = 0
    for chunk in chunks:
        chunk_len = len(chunk)
        chunk_start_idx = current_pointer
        chunk_end_idx = current_pointer + chunk_len

        chunk_start = None
        chunk_end = None
        for start_idx, end_idx, start_time, end_time in index_map:
            if end_idx >= chunk_start_idx and chunk_start is None:
                chunk_start = start_time
            if start_idx <= chunk_end_idx:
                chunk_end = end_time

        chunked_output.append({
            "start": round(chunk_start, 2) if chunk_start is not None else 0,
            "end": round(chunk_end, 2) if chunk_end is not None else 0,
            "text": chunk.strip()
        })

        current_pointer += chunk_len

    return chunked_output


@app.post("/api/generate-chapters")
async def generate_chapters(request: VideoChapterRequest):
    try:
        # Check if OpenAI API key is set
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, detail="OpenAI API key not configured")

        print(f"Processing video ID: {request.video_id}")

        # Get transcript
        try:
            raw_transcript = YouTubeTranscriptApi.get_transcript(
                request.video_id)
            print(f"Got transcript with {len(raw_transcript)} entries")
        except Exception as e:
            error_message = str(e)
            if "Subtitles are disabled" in error_message or "Could not retrieve a transcript" in error_message:
                # Return a user-friendly error for videos without captions
                return {
                    "chapters": [],
                    "error": "This video doesn't have captions available. AI timestamps can only be generated for videos with subtitles/captions enabled.",
                    "error_type": "no_captions"
                }
            raise HTTPException(
                status_code=400, detail=f"Failed to fetch transcript: {error_message}")

        cleaned = clean_transcript(raw_transcript)
        chunked = chunk_transcript(cleaned, chunk_size=500, chunk_overlap=50)
        print(f"Created {len(chunked)} chunks")

        # Generate chapter titles using LangChain
        prompt = PromptTemplate(
            input_variables=["transcript_chunks"],
            template="""
You are a highly intelligent assistant that summarizes video transcripts into concise chapter titles.

Generate a clear, meaningful title for each transcript section. These will be used as clickable timestamps.

Instructions:
- Output a JSON array of objects
- Each object must have: "start" (float), "end" (float), "title" (string)
- Titles should be 3-8 words, descriptive and engaging
- Capitalize properly (e.g., "Introduction to the Topic", "Key Concepts Explained")

Transcript chunks:
{transcript_chunks}

Return only the JSON array without any markdown formatting or explanation.
"""
        )

        try:
            llm = ChatOpenAI(
                model="gpt-4.1-nano",
                temperature=0.3,
                openai_api_key=api_key
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to initialize OpenAI: {str(e)}")

        chain = LLMChain(llm=llm, prompt=prompt)

        # Format chunks for the prompt
        chunks_text = json.dumps([{
            "start": chunk["start"],
            "end": chunk["end"],
            "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
        } for chunk in chunked])

        print("Calling OpenAI...")

        try:
            response = chain.run(transcript_chunks=chunks_text)
            # Print first 100 chars
            print(f"OpenAI response: {response[:100]}...")
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"OpenAI API error: {str(e)}")

        # Parse the response
        try:
            chapters = json.loads(response)
            print(f"Parsed {len(chapters)} chapters")
        except json.JSONDecodeError as e:
            print(f"Failed to parse response: {response}")
            raise HTTPException(
                status_code=500, detail=f"Failed to parse AI response: {str(e)}")

        return {"chapters": chapters}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Unexpected error: {str(e)}")

classifier = CustomEncoderWav2vec2Classifier.from_hparams(
    source=".",
    hparams_file="hyperparams.yaml"
)

emotions = {0: 'Neutral', 1: 'Anger', 2: 'Happiness', 3: 'Sadness'}

emotion_codes = ['neu', 'ang', 'hap', 'sad']


@app.post("/analyze-emotion/")
async def analyze_emotion(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    try:
        temp_filename = f"temp_{uuid.uuid4()}.wav"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")

    try:
        # Predict
        out_prob, score, index, text_lab = classifier.classify_file(
            temp_filename)

        # Process outputs
        score_val = score.item() if torch.is_tensor(score) else float(score)
        index_val = index.item() if torch.is_tensor(index) else int(index)
        text_lab_val = text_lab[0] if isinstance(
            text_lab, list) and text_lab else str(text_lab)
        probs = out_prob.squeeze().tolist() if torch.is_tensor(out_prob) else out_prob

        # Create response
        result = {
            "emotion": emotions.get(index_val, "Unknown"),
            "label": text_lab_val,
            "confidence": round(score_val, 4),
            "index": index_val,
            "probabilities": {
                emotions[i]: round(probs[i], 4) if i < len(probs) else 0.0
                for i in range(len(emotions))
            }
        }

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Prediction error: {str(e)}")

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)


async def get_weather(location: str = "Delhi") -> str:
    """Get weather using wttr.in (no API key required)"""
    try:
        async with httpx.AsyncClient() as client:
            # wttr.in provides weather data in various formats
            response = await client.get(
                f"https://wttr.in/{location}?format=%C+%t",
                headers={"User-Agent": "curl"}
            )

            if response.status_code == 200:
                # Response format: "Cloudy +25°C"
                weather_text = response.text.strip()
                return f"Current weather in {location}: {weather_text}"

    except Exception as e:
        print(f"Weather fetch error: {e}")

    return "Current weather in Delhi: unknown"


@app.post("/api/generate-recommendations")
async def generate_recommendations(request: RecommendationRequest):

    try:

        print(f"Generating recommendations for user: {request.user_id}")

        # Fetch user data from MongoDB via Express API

        async with httpx.AsyncClient() as client:

            # Get mood history (public endpoint)

            mood_url = f"http://localhost:4000/api/mood-history/{request.user_id}"

            print(f"Fetching mood from: {mood_url}")

            mood_response = await client.get(mood_url)

            print(f"Mood response status: {mood_response.status_code}")

            mood_data = mood_response.json() if mood_response.status_code == 200 else None

            # Get watch history (use public endpoint)

            watch_url = f"http://localhost:4000/api/watch-history/public/{request.user_id}?limit=20"

            print(f"Fetching watch history from: {watch_url}")

            watch_response = await client.get(watch_url)

            print(f"Watch response status: {watch_response.status_code}")

            watch_data = watch_response.json() if watch_response.status_code == 200 else None

        # Process mood data
        mood_context = "No mood data available"
        if mood_data and mood_data.get("aggregatedData"):
            agg_data = mood_data["aggregatedData"]
            mood_context = f"""
            Dominant mood: {agg_data.get('dominantMood', 'Unknown')}
            Mood distribution: {agg_data.get('moodDistribution', {})}
            Recent mood trend: {mood_data.get('moodTrend', 'stable')}
            """

        # Process watch history
        watch_context = "No watch history available"
        if watch_data and watch_data.get("watchHistory"):
            history = watch_data["watchHistory"]
            genres = {}
            completed_count = 0

            for item in history[:10]:  # Last 10 items
                for genre in item.get("genre", []):
                    genres[genre] = genres.get(genre, 0) + 1
                if item.get("completed"):
                    completed_count += 1

            watch_context = f"""
            Recently watched genres: {dict(sorted(genres.items(), key=lambda x: x[1], reverse=True)[:5])}
            Completion rate: {completed_count}/{len(history[:10])} completed
            Last watched: {history[0].get('title', 'Unknown') if history else 'None'}
            """

        # Get current time context
        current_hour = datetime.now().hour
        time_context = "morning" if 5 <= current_hour < 12 else \
            "afternoon" if 12 <= current_hour < 17 else \
            "evening" if 17 <= current_hour < 22 else "night"

        # Get weather - using regular function instead of tool
        weather = await get_weather("Delhi")

        # Create recommendation prompt
        prompt = PromptTemplate(
            input_variables=["mood_context",
                             "watch_context", "weather", "time_context"],
template="""
You are a content recommendation engine that generates search queries.

User Context:
{mood_context}
{watch_context}
Weather: {weather}
Time: {time_context}

Generate 7–10 SIMPLE, ONE-WORD search queries for movies/shows.

IMPORTANT RULES:
- ONLY use words from this array:
  ["action", "adventure", "comedy", "drama", "thriller", "horror", "romance", "sci-fi", "fantasy", "mystery", "crime", "documentary", "musical", "animation", "war", "western", "historical", "family", "biography", "supernatural", "psychological", "noir", "slasher", "movie", "tv-series", "web-series", "anime", "short-film", "mini-series", "docuseries", "reality-show", "talk-show", "stand-up", "live-performance", "anthology", "ova", "ona", "special", "sports", "school", "slice-of-life", "superhero", "dystopian", "post-apocalyptic", "survival", "cyberpunk", "space", "time-travel", "aliens", "vampires", "zombies", "mythology", "crime-investigation", "political", "legal", "medical", "gaming", "idol", "music", "cooking", "travel", "friendship", "coming-of-age"]

- Use **single words only**
- Avoid compound terms (e.g., no “sci fi” — use “sci-fi”)
- Keep it extremely simple and commonly understood
- Tailor choices based on mood, weather, and time

Output Format — JSON array only:
[
  {{"query": "action", "reason": "popular genre", "priority": 8}},
  {{"query": "comedy", "reason": "mood boost", "priority": 7}},
  {{"query": "thriller", "reason": "evening entertainment", "priority": 6}}
]
"""
        )

        # Generate recommendations
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        chain = LLMChain(llm=llm, prompt=prompt)

        # Use invoke instead of run for newer LangChain versions
        response = chain.invoke({
            "mood_context": mood_context,
            "watch_context": watch_context,
            "weather": weather,
            "time_context": time_context
        })

        # Extract the output text from response
        response_text = response.get("text", response) if isinstance(
            response, dict) else str(response)

        # Parse response
        try:
            search_queries = json.loads(response_text)
            # Sort by priority
            search_queries.sort(key=lambda x: x.get(
                "priority", 0), reverse=True)
        except json.JSONDecodeError:
            print(f"Failed to parse response: {response_text}")
            raise HTTPException(
                status_code=500, detail="Failed to parse AI response")

        return RecommendationResponse(
            search_queries=search_queries[:request.limit],
            context={
                "mood_summary": mood_context,
                "watch_summary": watch_context,
                "weather": weather,
                "time_of_day": time_context
            },
            generated_at=datetime.now().isoformat()
        )

    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Failed to generate recommendations: {str(e)}")
