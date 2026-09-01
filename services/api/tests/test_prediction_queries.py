from datetime import datetime, timedelta, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Prediction Query Host",
            "ip_address": "8.8.8.8",
            "description": "Host used for prediction query tests",
        },
    )

    assert response.status_code == 201

    return response.json()


def create_measurement_history(
    client,
    monkeypatch,
    host_id,
):
    now = datetime.now(timezone.utc)

    measurements = iter(
        [
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=now - timedelta(minutes=2),
                latency_ms=20.0,
                packet_loss_pct=0.0,
                success=True,
                packets_sent=4,
                packets_received=4,
            ),
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=now - timedelta(minutes=1),
                latency_ms=25.0,
                packet_loss_pct=0.0,
                success=True,
                packets_sent=4,
                packets_received=4,
            ),
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=now,
                latency_ms=30.0,
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

    for _ in range(3):
        response = client.post(
            f"/hosts/{host_id}/measure"
        )

        assert response.status_code == 201


def test_prediction_history_can_be_retrieved(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    prediction_response = client.post(
        f"/hosts/{host['id']}/prediction"
    )

    assert prediction_response.status_code == 201

    response = client.get(
        f"/hosts/{host['id']}/predictions"
    )

    assert response.status_code == 200

    predictions = response.json()

    assert len(predictions) == 1
    assert predictions[0]["host_id"] == host["id"]


def test_latest_prediction_can_be_retrieved(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    first_response = client.post(
        f"/hosts/{host['id']}/prediction"
    )

    second_response = client.post(
        f"/hosts/{host['id']}/prediction"
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    response = client.get(
        f"/hosts/{host['id']}/predictions/latest"
    )

    assert response.status_code == 200

    latest = response.json()

    assert latest["id"] == second_response.json()["id"]


def test_prediction_history_limit_is_applied(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    for _ in range(3):
        response = client.post(
            f"/hosts/{host['id']}/prediction"
        )

        assert response.status_code == 201

    response = client.get(
        f"/hosts/{host['id']}/predictions",
        params={
            "limit": 2,
        },
    )

    assert response.status_code == 200

    predictions = response.json()

    assert len(predictions) == 2


def test_latest_prediction_returns_404_when_empty(
    client,
):
    host = create_test_host(client)

    response = client.get(
        f"/hosts/{host['id']}/predictions/latest"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "No predictions found for this host."
    }


def test_prediction_history_for_nonexistent_host(
    client,
):
    response = client.get(
        "/hosts/999999/predictions"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }