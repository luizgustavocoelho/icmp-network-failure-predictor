from datetime import datetime, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "History Test Host",
            "ip_address": "8.8.8.8",
            "description": "Host used for history tests",
        },
    )

    assert response.status_code == 201

    return response.json()


def create_measurements(
    client,
    monkeypatch,
    host_id,
    measurements,
):
    measurement_iterator = iter(measurements)

    monkeypatch.setattr(
        hosts_router,
        "ping_host",
        lambda host: next(measurement_iterator),
    )

    for _ in measurements:
        response = client.post(
            f"/hosts/{host_id}/measure"
        )

        assert response.status_code == 201


def test_history_can_be_filtered_by_status(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    measurements = [
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 10, 0,
                tzinfo=timezone.utc,
            ),
            latency_ms=20.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        ),
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 10, 5,
                tzinfo=timezone.utc,
            ),
            latency_ms=350.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        ),
    ]

    create_measurements(
        client,
        monkeypatch,
        host["id"],
        measurements,
    )

    response = client.get(
        f"/hosts/{host['id']}/measurements",
        params={
            "status": "RISK",
        },
    )

    assert response.status_code == 200

    history = response.json()

    assert len(history) == 1
    assert history[0]["status"] == "RISK"
    assert history[0]["latency_ms"] == 350.0


def test_history_limit_is_applied(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    measurements = [
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 10, minute,
                tzinfo=timezone.utc,
            ),
            latency_ms=20.0 + minute,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        )
        for minute in range(3)
    ]

    create_measurements(
        client,
        monkeypatch,
        host["id"],
        measurements,
    )

    response = client.get(
        f"/hosts/{host['id']}/measurements",
        params={
            "limit": 2,
        },
    )

    assert response.status_code == 200

    history = response.json()

    assert len(history) == 2


def test_history_can_be_filtered_by_period(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    measurements = [
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 8, 0,
                tzinfo=timezone.utc,
            ),
            latency_ms=10.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        ),
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 12, 0,
                tzinfo=timezone.utc,
            ),
            latency_ms=20.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        ),
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 18, 0,
                tzinfo=timezone.utc,
            ),
            latency_ms=30.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        ),
    ]

    create_measurements(
        client,
        monkeypatch,
        host["id"],
        measurements,
    )

    response = client.get(
        f"/hosts/{host['id']}/measurements",
        params={
            "start_at": "2026-09-01T10:00:00Z",
            "end_at": "2026-09-01T14:00:00Z",
        },
    )

    assert response.status_code == 200

    history = response.json()

    assert len(history) == 1
    assert history[0]["latency_ms"] == 20.0


def test_invalid_history_period_is_rejected(
    client,
):
    host = create_test_host(client)

    response = client.get(
        f"/hosts/{host['id']}/measurements",
        params={
            "start_at": "2026-09-02T10:00:00Z",
            "end_at": "2026-09-01T10:00:00Z",
        },
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": "start_at cannot be later than end_at."
    }


def test_measurement_summary_calculates_statistics(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    measurements = [
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 10, 0,
                tzinfo=timezone.utc,
            ),
            latency_ms=10.0,
            packet_loss_pct=0.0,
            success=True,
            packets_sent=4,
            packets_received=4,
        ),
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 10, 5,
                tzinfo=timezone.utc,
            ),
            latency_ms=20.0,
            packet_loss_pct=25.0,
            success=True,
            packets_sent=4,
            packets_received=3,
        ),
        ICMPMeasurement(
            host="8.8.8.8",
            measured_at=datetime(
                2026, 9, 1, 10, 10,
                tzinfo=timezone.utc,
            ),
            latency_ms=None,
            packet_loss_pct=100.0,
            success=False,
            packets_sent=4,
            packets_received=0,
        ),
    ]

    create_measurements(
        client,
        monkeypatch,
        host["id"],
        measurements,
    )

    response = client.get(
        f"/hosts/{host['id']}/measurements/summary"
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary["host_id"] == host["id"]
    assert summary["total_measurements"] == 3

    assert summary["average_latency_ms"] == 15.0
    assert summary["minimum_latency_ms"] == 10.0
    assert summary["maximum_latency_ms"] == 20.0

    assert round(
        summary["average_packet_loss_pct"],
        2,
    ) == 41.67

    assert summary["ok_count"] == 1
    assert summary["risk_count"] == 1
    assert summary["failure_count"] == 1


def test_empty_measurement_summary(
    client,
):
    host = create_test_host(client)

    response = client.get(
        f"/hosts/{host['id']}/measurements/summary"
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary["total_measurements"] == 0
    assert summary["average_latency_ms"] is None
    assert summary["minimum_latency_ms"] is None
    assert summary["maximum_latency_ms"] is None
    assert summary["average_packet_loss_pct"] is None

    assert summary["ok_count"] == 0
    assert summary["risk_count"] == 0
    assert summary["failure_count"] == 0