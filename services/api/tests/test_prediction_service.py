from datetime import datetime, timedelta, timezone

import pytest

from app.models.measurement import Measurement
from app.services.network_classifier import NetworkStatus
from app.services.prediction_service import (
    PredictionResult,
    _linear_prediction,
    calculate_prediction,
)


def build_measurement(
    measured_at: datetime,
    latency_ms: float | None,
    packet_loss_pct: float,
    status: str,
    success: bool = True,
) -> Measurement:
    return Measurement(
        host_id=1,
        measured_at=measured_at,
        latency_ms=latency_ms,
        packet_loss_pct=packet_loss_pct,
        success=success,
        status=status,
    )


def test_linear_prediction_detects_increasing_trend():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    timestamps = [
        base_time,
        base_time + timedelta(minutes=1),
        base_time + timedelta(minutes=2),
    ]

    values = [
        20.0,
        25.0,
        30.0,
    ]

    forecast_for = (
        base_time
        + timedelta(minutes=3)
    )

    prediction = _linear_prediction(
        timestamps=timestamps,
        values=values,
        forecast_for=forecast_for,
    )

    assert prediction == pytest.approx(
        35.0
    )


def test_calculate_prediction_returns_ok():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    measurements = [
        build_measurement(
            measured_at=base_time,
            latency_ms=20.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=1),
            latency_ms=25.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=2),
            latency_ms=30.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
    ]

    forecast_for = (
        base_time
        + timedelta(minutes=3)
    )

    result = calculate_prediction(
        measurements=measurements,
        forecast_for=forecast_for,
    )

    assert isinstance(
        result,
        PredictionResult,
    )

    assert result.predicted_latency_ms == pytest.approx(
        35.0
    )

    assert result.predicted_packet_loss_pct == 0.0
    assert result.predicted_status == NetworkStatus.OK


def test_calculate_prediction_detects_risk():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    measurements = [
        build_measurement(
            measured_at=base_time,
            latency_ms=200.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=1),
            latency_ms=250.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=2),
            latency_ms=300.0,
            packet_loss_pct=0.0,
            status="RISK",
        ),
    ]

    forecast_for = (
        base_time
        + timedelta(minutes=3)
    )

    result = calculate_prediction(
        measurements=measurements,
        forecast_for=forecast_for,
    )

    assert result.predicted_latency_ms == pytest.approx(
        350.0
    )

    assert result.predicted_status == NetworkStatus.RISK


def test_calculate_prediction_detects_failure():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    measurements = [
        build_measurement(
            measured_at=base_time,
            latency_ms=None,
            packet_loss_pct=100.0,
            status="FAILURE",
            success=False,
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=1),
            latency_ms=None,
            packet_loss_pct=100.0,
            status="FAILURE",
            success=False,
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=2),
            latency_ms=None,
            packet_loss_pct=100.0,
            status="FAILURE",
            success=False,
        ),
    ]

    forecast_for = (
        base_time
        + timedelta(minutes=3)
    )

    result = calculate_prediction(
        measurements=measurements,
        forecast_for=forecast_for,
    )

    assert result.predicted_latency_ms is None
    assert result.predicted_packet_loss_pct == 100.0
    assert result.predicted_status == NetworkStatus.FAILURE


def test_packet_loss_prediction_is_clamped_to_zero():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    measurements = [
        build_measurement(
            measured_at=base_time,
            latency_ms=20.0,
            packet_loss_pct=50.0,
            status="RISK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=1),
            latency_ms=20.0,
            packet_loss_pct=25.0,
            status="RISK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=2),
            latency_ms=20.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
    ]

    result = calculate_prediction(
        measurements=measurements,
        forecast_for=(
            base_time
            + timedelta(minutes=5)
        ),
    )

    assert result.predicted_packet_loss_pct == 0.0


def test_packet_loss_prediction_is_clamped_to_100():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    measurements = [
        build_measurement(
            measured_at=base_time,
            latency_ms=20.0,
            packet_loss_pct=50.0,
            status="RISK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=1),
            latency_ms=20.0,
            packet_loss_pct=75.0,
            status="RISK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=2),
            latency_ms=None,
            packet_loss_pct=100.0,
            status="FAILURE",
            success=False,
        ),
    ]

    result = calculate_prediction(
        measurements=measurements,
        forecast_for=(
            base_time
            + timedelta(minutes=5)
        ),
    )

    assert result.predicted_packet_loss_pct == 100.0
    assert result.predicted_status == NetworkStatus.FAILURE


def test_prediction_requires_at_least_three_measurements():
    base_time = datetime(
        2026,
        9,
        1,
        10,
        0,
        tzinfo=timezone.utc,
    )

    measurements = [
        build_measurement(
            measured_at=base_time,
            latency_ms=20.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
        build_measurement(
            measured_at=base_time + timedelta(minutes=1),
            latency_ms=25.0,
            packet_loss_pct=0.0,
            status="OK",
        ),
    ]

    with pytest.raises(
        ValueError,
        match="At least 3 measurements are required",
    ):
        calculate_prediction(
            measurements=measurements,
            forecast_for=(
                base_time
                + timedelta(minutes=5)
            ),
        )