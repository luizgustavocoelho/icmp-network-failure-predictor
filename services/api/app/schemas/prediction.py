from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.services.network_classifier import NetworkStatus


class PredictionResponse(BaseModel):
    id: int
    host_id: int
    generated_at: datetime
    forecast_for: datetime
    predicted_latency_ms: float | None
    predicted_packet_loss_pct: float | None
    predicted_status: NetworkStatus
    confidence: float | None

    model_config = ConfigDict(
        from_attributes=True,
    )