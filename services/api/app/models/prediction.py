from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    __table_args__ = (
        CheckConstraint(
            (
                "predicted_latency_ms IS NULL "
                "OR predicted_latency_ms >= 0"
            ),
            name="chk_predictions_latency",
        ),
        CheckConstraint(
            (
                "predicted_packet_loss_pct IS NULL "
                "OR ("
                "predicted_packet_loss_pct >= 0 "
                "AND predicted_packet_loss_pct <= 100"
                ")"
            ),
            name="chk_predictions_packet_loss",
        ),
        CheckConstraint(
            (
                "predicted_status "
                "IN ('OK', 'RISK', 'FAILURE')"
            ),
            name="chk_predictions_status",
        ),
        CheckConstraint(
            (
                "confidence IS NULL "
                "OR (confidence >= 0 AND confidence <= 100)"
            ),
            name="chk_predictions_confidence",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    host_id: Mapped[int] = mapped_column(
        ForeignKey(
            "hosts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    forecast_for: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    predicted_latency_ms: Mapped[float | None] = mapped_column(
        Numeric(10, 3),
        nullable=True,
    )

    predicted_packet_loss_pct: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    predicted_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    confidence: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )