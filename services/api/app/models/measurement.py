from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Measurement(Base):
    __tablename__ = "measurements"

    __table_args__ = (
        CheckConstraint(
            "packet_loss_pct >= 0 AND packet_loss_pct <= 100",
            name="chk_measurements_packet_loss",
        ),
        CheckConstraint(
            "latency_ms IS NULL OR latency_ms >= 0",
            name="chk_measurements_latency",
        ),
        CheckConstraint(
            "status IS NULL OR status IN ('OK', 'RISK', 'FAILURE')",
            name="chk_measurements_status",
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

    measured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    latency_ms: Mapped[float | None] = mapped_column(
        Numeric(10, 3),
        nullable=True,
    )

    packet_loss_pct: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    success: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    status: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )