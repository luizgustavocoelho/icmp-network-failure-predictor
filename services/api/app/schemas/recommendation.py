from pydantic import BaseModel

from app.services.network_classifier import NetworkStatus
from app.services.recommendation_service import (
    ActivitySuitability,
    ActivityType,
)


class ActivityRecommendationResponse(BaseModel):
    activity: ActivityType
    suitability: ActivitySuitability
    message: str


class RecommendationResponse(BaseModel):
    host_id: int
    prediction_id: int
    predicted_status: NetworkStatus
    recommendations: list[ActivityRecommendationResponse]