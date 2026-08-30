import pytest

from app.services.network_classifier import (
    NetworkStatus,
    classify_network_condition,
)


def test_classifies_healthy_network_as_ok():
    status = classify_network_condition(
        latency_ms=20.0,
        packet_loss_pct=0.0,
        success=True,
    )

    assert status == NetworkStatus.OK


def test_latency_just_below_threshold_is_ok():
    status = classify_network_condition(
        latency_ms=299.9,
        packet_loss_pct=0.0,
        success=True,
    )

    assert status == NetworkStatus.OK


def test_latency_at_threshold_is_risk():
    status = classify_network_condition(
        latency_ms=300.0,
        packet_loss_pct=0.0,
        success=True,
    )

    assert status == NetworkStatus.RISK


def test_latency_above_threshold_is_risk():
    status = classify_network_condition(
        latency_ms=450.0,
        packet_loss_pct=0.0,
        success=True,
    )

    assert status == NetworkStatus.RISK


def test_packet_loss_just_below_threshold_is_ok():
    status = classify_network_condition(
        latency_ms=20.0,
        packet_loss_pct=0.99,
        success=True,
    )

    assert status == NetworkStatus.OK


def test_packet_loss_at_threshold_is_risk():
    status = classify_network_condition(
        latency_ms=20.0,
        packet_loss_pct=1.0,
        success=True,
    )

    assert status == NetworkStatus.RISK


def test_partial_packet_loss_is_risk():
    status = classify_network_condition(
        latency_ms=20.0,
        packet_loss_pct=25.0,
        success=True,
    )

    assert status == NetworkStatus.RISK


def test_total_packet_loss_is_failure():
    status = classify_network_condition(
        latency_ms=None,
        packet_loss_pct=100.0,
        success=False,
    )

    assert status == NetworkStatus.FAILURE


def test_unsuccessful_measurement_is_failure():
    status = classify_network_condition(
        latency_ms=None,
        packet_loss_pct=75.0,
        success=False,
    )

    assert status == NetworkStatus.FAILURE


def test_missing_latency_with_success_is_risk():
    status = classify_network_condition(
        latency_ms=None,
        packet_loss_pct=0.0,
        success=True,
    )

    assert status == NetworkStatus.RISK


def test_high_latency_and_packet_loss_is_risk():
    status = classify_network_condition(
        latency_ms=500.0,
        packet_loss_pct=50.0,
        success=True,
    )

    assert status == NetworkStatus.RISK


def test_rejects_negative_packet_loss():
    with pytest.raises(
        ValueError,
        match="Packet loss must be between 0 and 100.",
    ):
        classify_network_condition(
            latency_ms=20.0,
            packet_loss_pct=-1.0,
            success=True,
        )


def test_rejects_packet_loss_above_100():
    with pytest.raises(
        ValueError,
        match="Packet loss must be between 0 and 100.",
    ):
        classify_network_condition(
            latency_ms=20.0,
            packet_loss_pct=101.0,
            success=True,
        )


def test_rejects_negative_latency():
    with pytest.raises(
        ValueError,
        match="Latency cannot be negative.",
    ):
        classify_network_condition(
            latency_ms=-1.0,
            packet_loss_pct=0.0,
            success=True,
        )