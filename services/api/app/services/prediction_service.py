from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.measurement import Measurement
from app.models.prediction import Prediction
from app.services.network_classifier import (
    NetworkStatus,
    classify_network_condition,
)


MINIMUM_MEASUREMENTS = 3
PREDICTION_WINDOW_SIZE = 5
DEFAULT_FORECAST_MINUTES = 5


@dataclass(frozen=True)
class PredictionResult:
    forecast_for: datetime
    predicted_latency_ms: float | None
    predicted_packet_loss_pct: float
    predicted_status: NetworkStatus


def _clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    return max(
        minimum,
        min(value, maximum),
    )


def _linear_prediction(
    timestamps: list[datetime],
    values: list[float],
    forecast_for: datetime,
) -> float:
    if len(timestamps) != len(values):
        raise ValueError(
            "Timestamps and values must have the same length."
        )

    if not values:
        raise ValueError(
            "At least one value is required."
        )

    if len(values) == 1:
        return values[0]

    base_time = timestamps[0]

    x_values = [
        (timestamp - base_time).total_seconds()
        for timestamp in timestamps
    ]

    forecast_x = (
        forecast_for - base_time
    ).total_seconds()

    x_mean = sum(x_values) / len(x_values)
    y_mean = sum(values) / len(values)

    denominator = sum(
        (x - x_mean) ** 2
        for x in x_values
    )

    if denominator == 0:
        return values[-1]

    numerator = sum(
        (x - x_mean) * (y - y_mean)
        for x, y in zip(
            x_values,
            values,
            strict=True,
        )
    )

    slope = numerator / denominator
    intercept = y_mean - slope * x_mean

    return intercept + slope * forecast_x


def calculate_prediction(
    measurements: list[Measurement],
    forecast_for: datetime,
) -> PredictionResult:
    if len(measurements) < MINIMUM_MEASUREMENTS:
        raise ValueError(
            (
                "At least "
                f"{MINIMUM_MEASUREMENTS} measurements "
                "are required to generate a prediction."
            )
        )

    ordered_measurements = sorted(
        measurements,
        key=lambda item: item.measured_at,
    )

    window = ordered_measurements[
        -PREDICTION_WINDOW_SIZE:
    ]

    latency_measurements = [
        measurement
        for measurement in window
        if measurement.latency_ms is not None
    ]

    predicted_latency_ms = None

    if latency_measurements:
        predicted_latency_ms = _linear_prediction(
            timestamps=[
                measurement.measured_at
                for measurement in latency_measurements
            ],
            values=[
                float(measurement.latency_ms)
                for measurement in latency_measurements
            ],
            forecast_for=forecast_for,
        )

        predicted_latency_ms = round(
            max(
                0.0,
                predicted_latency_ms,
            ),
            3,
        )

    predicted_packet_loss_pct = _linear_prediction(
        timestamps=[
            measurement.measured_at
            for measurement in window
        ],
        values=[
            float(measurement.packet_loss_pct)
            for measurement in window
        ],
        forecast_for=forecast_for,
    )

    predicted_packet_loss_pct = round(
        _clamp(
            predicted_packet_loss_pct,
            0.0,
            100.0,
        ),
        2,
    )

    predicted_success = (
        predicted_packet_loss_pct < 100
    )

    predicted_status = classify_network_condition(
        latency_ms=predicted_latency_ms,
        packet_loss_pct=predicted_packet_loss_pct,
        success=predicted_success,
    )

    return PredictionResult(
        forecast_for=forecast_for,
        predicted_latency_ms=predicted_latency_ms,
        predicted_packet_loss_pct=predicted_packet_loss_pct,
        predicted_status=predicted_status,
    )


def generate_prediction(
    db: Session,
    host_id: int,
    forecast_for: datetime | None = None,
) -> Prediction:
    query = (
        select(Measurement)
        .where(
            Measurement.host_id == host_id
        )
        .order_by(
            Measurement.measured_at.desc()
        )
        .limit(PREDICTION_WINDOW_SIZE)
    )

    measurements = list(
        db.scalars(query).all()
    )

    if len(measurements) < MINIMUM_MEASUREMENTS:
        raise ValueError(
            (
                "At least "
                f"{MINIMUM_MEASUREMENTS} measurements "
                "are required to generate a prediction."
            )
        )

    now = datetime.now(timezone.utc)

    if forecast_for is None:
        forecast_for = (
            now
            + timedelta(
                minutes=DEFAULT_FORECAST_MINUTES
            )
        )

    if forecast_for.tzinfo is None:
        raise ValueError(
            "forecast_for must include timezone information."
        )

    forecast_for = forecast_for.astimezone(
        timezone.utc
    )

    if forecast_for <= now:
        raise ValueError(
            "forecast_for must be in the future."
        )

    result = calculate_prediction(
        measurements=measurements,
        forecast_for=forecast_for,
    )

    prediction = Prediction(
        host_id=host_id,
        forecast_for=result.forecast_for,
        predicted_latency_ms=(
            result.predicted_latency_ms
        ),
        predicted_packet_loss_pct=(
            result.predicted_packet_loss_pct
        ),
        predicted_status=(
            result.predicted_status.value
        ),
        confidence=None,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction