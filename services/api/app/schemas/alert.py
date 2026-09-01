from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class AlertSeverity(StrEnum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertResponse(BaseModel):
    id: int
    host_id: int
    measurement_id: int | None
    severity: AlertSeverity
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )