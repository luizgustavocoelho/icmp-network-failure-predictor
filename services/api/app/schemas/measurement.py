from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MeasurementResponse(BaseModel):
    id: int
    host_id: int
    measured_at: datetime
    latency_ms: float | None
    packet_loss_pct: float
    success: bool
    status: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )