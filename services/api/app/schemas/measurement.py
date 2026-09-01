from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.services.network_classifier import NetworkStatus


class MeasurementResponse(BaseModel):
    id: int
    host_id: int
    measured_at: datetime
    latency_ms: float | None
    packet_loss_pct: float
    success: bool
    status: NetworkStatus
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class MeasurementSummaryResponse(BaseModel):
    host_id: int
    total_measurements: int
    average_latency_ms: float | None
    minimum_latency_ms: float | None
    maximum_latency_ms: float | None
    average_packet_loss_pct: float | None
    ok_count: int
    risk_count: int
    failure_count: int