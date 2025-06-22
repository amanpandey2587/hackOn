from pydantic import BaseModel
from typing import List

class RecommendationRequest(BaseModel):
    user_id: str
    streaming_service: str = "All"

class Recommendation(BaseModel):
    title: str
    genre: str
    platform: str
    reason: str

class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
