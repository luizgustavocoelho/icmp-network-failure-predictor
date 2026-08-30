from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from app.services import icmp_monitor
from app.services.icmp_monitor import (
    ICMPMeasurement,
    _extract_latency,
    monitor_host_periodically,
    ping_host,
)


def fake_process(
    returncode: int,
    stdout: str = "",
    stderr: str = "",
):
    return SimpleNamespace(
        returncode=returncode,
        stdout=stdout,
        stderr=stderr,
    )


def test_extract_latency_from_english_output():
    output = "Reply from 8.8.8.8: bytes=32 time=18ms TTL=117"

    latency = _extract_latency(output)

    assert latency == 18.0


def test_extract_latency_from_portuguese_output():
    output = "Resposta de 8.8.8.8: bytes=32 tempo=21ms TTL=117"

    latency = _extract_latency(output)

    assert latency == 21.0


def test_extract_latency_when_not_available():
    output = "Request timed out."

    latency = _extract_latency(output)

    assert latency is None


def test_ping_host_success(monkeypatch):
    def mock_run(*args, **kwargs):
        return fake_process(
            returncode=0,
            stdout="Reply from 8.8.8.8: bytes=32 time=20ms TTL=117",
        )

    monkeypatch.setattr(
        icmp_monitor.subprocess,
        "run",
        mock_run,
    )

    measurement = ping_host(
        host="8.8.8.8",
        count=4,
        timeout_ms=1000,
    )

    assert measurement.host == "8.8.8.8"
    assert measurement.success is True
    assert measurement.packets_sent == 4
    assert measurement.packets_received == 4
    assert measurement.packet_loss_pct == 0.0
    assert measurement.latency_ms == 20.0


def test_ping_host_partial_packet_loss(monkeypatch):
    responses = iter(
        [
            fake_process(
                0,
                "Reply from 8.8.8.8: bytes=32 time=10ms TTL=117",
            ),
            fake_process(
                1,
                "Request timed out.",
            ),
            fake_process(
                0,
                "Reply from 8.8.8.8: bytes=32 time=30ms TTL=117",
            ),
            fake_process(
                1,
                "Request timed out.",
            ),
        ]
    )

    def mock_run(*args, **kwargs):
        return next(responses)

    monkeypatch.setattr(
        icmp_monitor.subprocess,
        "run",
        mock_run,
    )

    measurement = ping_host(
        host="8.8.8.8",
        count=4,
        timeout_ms=1000,
    )

    assert measurement.success is True
    assert measurement.packets_sent == 4
    assert measurement.packets_received == 2
    assert measurement.packet_loss_pct == 50.0
    assert measurement.latency_ms == 20.0


def test_ping_host_total_packet_loss(monkeypatch):
    def mock_run(*args, **kwargs):
        return fake_process(
            returncode=1,
            stdout="Request timed out.",
        )

    monkeypatch.setattr(
        icmp_monitor.subprocess,
        "run",
        mock_run,
    )

    measurement = ping_host(
        host="203.0.113.1",
        count=4,
        timeout_ms=1000,
    )

    assert measurement.success is False
    assert measurement.packets_sent == 4
    assert measurement.packets_received == 0
    assert measurement.packet_loss_pct == 100.0
    assert measurement.latency_ms is None


def test_ping_host_rejects_invalid_count():
    with pytest.raises(
        ValueError,
        match="Ping count must be greater than zero.",
    ):
        ping_host(
            host="127.0.0.1",
            count=0,
        )


def test_ping_host_rejects_invalid_timeout():
    with pytest.raises(
        ValueError,
        match="Timeout must be greater than zero.",
    ):
        ping_host(
            host="127.0.0.1",
            timeout_ms=0,
        )


def test_periodic_monitoring(monkeypatch):
    ping_calls = []
    sleep_calls = []

    def mock_ping_host(
        host: str,
        count: int,
        timeout_ms: int,
    ):
        ping_calls.append(
            {
                "host": host,
                "count": count,
                "timeout_ms": timeout_ms,
            }
        )

        return ICMPMeasurement(
            host=host,
            measured_at=datetime.now(timezone.utc),
            latency_ms=1.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=count,
            packets_received=count,
        )

    def mock_sleep(seconds):
        sleep_calls.append(seconds)

    monkeypatch.setattr(
        icmp_monitor,
        "ping_host",
        mock_ping_host,
    )

    monkeypatch.setattr(
        icmp_monitor.time,
        "sleep",
        mock_sleep,
    )

    measurements = list(
        monitor_host_periodically(
            host="127.0.0.1",
            interval_seconds=1,
            count=1,
            timeout_ms=1000,
            iterations=3,
        )
    )

    assert len(measurements) == 3
    assert len(ping_calls) == 3

    assert sleep_calls == [
        1,
        1,
    ]

    for measurement in measurements:
        assert measurement.success is True
        assert measurement.host == "127.0.0.1"


def test_periodic_monitoring_rejects_invalid_interval():
    with pytest.raises(
        ValueError,
        match="Monitoring interval must be greater than zero.",
    ):
        list(
            monitor_host_periodically(
                host="127.0.0.1",
                interval_seconds=0,
                iterations=1,
            )
        )


def test_periodic_monitoring_rejects_invalid_iterations():
    with pytest.raises(
        ValueError,
        match="Iterations must be greater than zero.",
    ):
        list(
            monitor_host_periodically(
                host="127.0.0.1",
                iterations=0,
            )
        )