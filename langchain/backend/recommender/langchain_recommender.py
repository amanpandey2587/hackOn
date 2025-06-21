from langchain.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEndpoint
import os
from dotenv import load_dotenv

load_dotenv()

# Prompt template for generating recommendations
prompt = PromptTemplate(
    input_variables=["mood", "history", "weather", "time", "streaming_service"],
    template="""
You are an intelligent AI movie recommender system.

Based on the following inputs:
- Mood: {mood}
- Watch History Summary: {history}
- Current Weather: {weather}
- Time of Day: {time}
- Streaming Service: {streaming_service}

Recommend 5 movies or shows that match the user's context.
Only include content that is available on the specified streaming service.
If the service is 'All', you may choose freely from Netflix, Hulu, or Amazon Prime.

Format:
Title | Genre | Platform | Reason
"""
)

# Hugging Face LLM from Langchain
llm = HuggingFaceEndpoint(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    temperature=0.7,
    max_new_tokens=100,
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
)
def parse_response(response: str):
    lines = response.strip().split("\n")
    recommendations = []
    for line in lines:
        parts = [p.strip() for p in line.split('|')]
        if len(parts) == 4:
            recommendations.append({
                "title": parts[0],
                "genre": parts[1],
                "platform": parts[2],
                "reason": parts[3],
            })
    return recommendations

def generate_recommendations(mood, history, weather, time, streaming_service):
    input_data = {
        "mood": mood,
        "history": "\n".join(history),
        "weather": weather,
        "time": time,
        "streaming_service": streaming_service,
    }
    response = llm.invoke(prompt.format(**input_data))
    return parse_response(response)