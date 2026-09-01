from datetime import datetime, timedelta, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Prediction Test Host",
            "ip_address": "8.8.8.8",
            "description": "Host used for prediction tests",
        },
    )

    assert response.status_code == 201

    return response.json()


def create_measurement_history(
    client,
    monkeypatch,
    host_id,
):
    now = datetime.now(
        timezone.utc
    )

    measurements = iter(
        [
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=(
                    now
                    - timedelta(minutes=2)
                ),
                latency_ms=20.0,
                packet_loss_pct=0.0,
                success=True,
                packets_sent=4,
                packets_received=4,
            ),
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=(
                    now
                    - timedelta(minutes=1)
                ),
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


def test_prediction_endpoint_generates_prediction(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    response = client.post(
        f"/hosts/{host['id']}/prediction"
    )

    assert response.status_code == 201

    prediction = response.json()

    assert prediction["host_id"] == host["id"]

    assert (
        prediction["predicted_latency_ms"]
        is not None
    )

    assert (
        0
        <= prediction["predicted_packet_loss_pct"]
        <= 100
    )

    assert prediction["predicted_status"] in {
        "OK",
        "RISK",
        "FAILURE",
    }

    assert prediction["confidence"] is None
    assert prediction["id"] is not None


def test_prediction_forecast_is_in_the_future(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    response = client.post(
        f"/hosts/{host['id']}/prediction"
    )

    prediction = response.json()

    generated_at = datetime.fromisoformat(
        prediction["generated_at"]
    )

    forecast_for = datetime.fromisoformat(
        prediction["forecast_for"]
    )

    assert forecast_for > generated_at


def test_prediction_requires_enough_history(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    now = datetime.now(timezone.utc)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=now,
        latency_ms=20.0,
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

    for _ in range(2):
        response = client.post(
            f"/hosts/{host['id']}/measure"
        )

        assert response.status_code == 201

    response = client.post(
        f"/hosts/{host['id']}/prediction"
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": (
            "At least 3 measurements are required "
            "to generate a prediction."
        )
    }


def test_prediction_for_nonexistent_host(
    client,
):
    response = client.post(
        "/hosts/999999/prediction"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }