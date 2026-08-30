from datetime import datetime, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Google DNS",
            "ip_address": "8.8.8.8",
            "description": "Host used for measurement tests",
        },
    )

    assert response.status_code == 201

    return response.json()


def test_measure_host_and_persist_measurement(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=datetime.now(timezone.utc),
        latency_ms=15.5,
        packet_loss_pct=0.0,
        success=True,
        packets_sent=4,
        packets_received=4,
    )

    monkeypatch.setattr(
        hosts_router,
        "ping_host",
        lambda host: fake_measurement,
    )

    response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    assert response.status_code == 201

    data = response.json()

    assert data["host_id"] == host["id"]
    assert data["latency_ms"] == 15.5
    assert data["packet_loss_pct"] == 0.0
    assert data["success"] is True
    assert data["status"] is None
    assert "id" in data
    assert "measured_at" in data
    assert "created_at" in data


def test_measurement_is_available_in_history(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=datetime.now(timezone.utc),
        latency_ms=22.0,
        packet_loss_pct=25.0,
        success=True,
        packets_sent=4,
        packets_received=3,
    )

    monkeypatch.setattr(
        hosts_router,
        "ping_host",
        lambda host: fake_measurement,
    )

    measure_response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    assert measure_response.status_code == 201

    history_response = client.get(
        f"/hosts/{host['id']}/measurements"
    )

    assert history_response.status_code == 200

    history = history_response.json()

    assert len(history) == 1

    measurement = history[0]

    assert measurement["host_id"] == host["id"]
    assert measurement["latency_ms"] == 22.0
    assert measurement["packet_loss_pct"] == 25.0
    assert measurement["success"] is True
    assert measurement["status"] is None


def test_measurement_history_returns_newest_first(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    measurements = iter(
        [
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=datetime(
                    2026,
                    8,
                    30,
                    20,
                    0,
                    0,
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
                    2026,
                    8,
                    30,
                    20,
                    5,
                    0,
                    tzinfo=timezone.utc,
                ),
                latency_ms=20.0,
                packet_loss_pct=0.0,
                success=True,
                packets_sent=4,
                packets_received=4,
            ),
        ]
    )

    monkeypatch.setattr(
        hosts_router,
        "ping_host",
        lambda host: next(measurements),
    )

    first_response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    second_response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    response = client.get(
        f"/hosts/{host['id']}/measurements"
    )

    assert response.status_code == 200

    history = response.json()

    assert len(history) == 2

    assert history[0]["latency_ms"] == 20.0
    assert history[1]["latency_ms"] == 10.0


def test_measure_nonexistent_host(client):
    response = client.post(
        "/hosts/999999/measure"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }


def test_measure_inactive_host(
    client,
):
    host = create_test_host(client)

    update_response = client.put(
        f"/hosts/{host['id']}",
        json={
            "name": "Google DNS",
            "ip_address": "8.8.8.8",
            "description": "Inactive test host",
            "is_active": False,
        },
    )

    assert update_response.status_code == 200

    response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    assert response.status_code == 409

    assert response.json() == {
        "detail": "Host is inactive."
    }


def test_history_for_nonexistent_host(client):
    response = client.get(
        "/hosts/999999/measurements"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }