from datetime import datetime, timedelta, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Recommendation Test Host",
            "ip_address": "8.8.8.8",
            "description": (
                "Host used for recommendation tests"
            ),
        },
    )

    assert response.status_code == 201

    return response.json()


def create_prediction(
    client,
    monkeypatch,
    host_id,
):
    now = datetime.now(timezone.utc)

    measurements = iter(
        [
            ICMPMeasurement(
                host="8.8.8.8",
                measured_at=(
                    now - timedelta(minutes=2)
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
                    now - timedelta(minutes=1)
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

    prediction_response = client.post(
        f"/hosts/{host_id}/prediction"
    )

    assert prediction_response.status_code == 201

    return prediction_response.json()


def test_recommendations_can_be_retrieved(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    prediction = create_prediction(
        client,
        monkeypatch,
        host["id"],
    )

    response = client.get(
        (
            f"/hosts/{host['id']}"
            f"/predictions/{prediction['id']}"
            "/recommendations"
        )
    )

    assert response.status_code == 200

    data = response.json()

    assert data["host_id"] == host["id"]
    assert data["prediction_id"] == prediction["id"]
    assert data["predicted_status"] == "OK"

    assert len(data["recommendations"]) == 5


def test_ok_prediction_returns_recommended_activities(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    prediction = create_prediction(
        client,
        monkeypatch,
        host["id"],
    )

    response = client.get(
        (
            f"/hosts/{host['id']}"
            f"/predictions/{prediction['id']}"
            "/recommendations"
        )
    )

    recommendations = (
        response.json()["recommendations"]
    )

    assert all(
        recommendation["suitability"]
        == "recommended"
        for recommendation in recommendations
    )


def test_recommendation_for_nonexistent_host(
    client,
):
    response = client.get(
        "/hosts/999999/predictions/1/recommendations"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }


def test_recommendation_for_nonexistent_prediction(
    client,
):
    host = create_test_host(client)

    response = client.get(
        (
            f"/hosts/{host['id']}"
            "/predictions/999999/recommendations"
        )
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Prediction not found."
    }


def test_prediction_must_belong_to_requested_host(
    client,
    monkeypatch,
):
    first_host = create_test_host(client)

    prediction = create_prediction(
        client,
        monkeypatch,
        first_host["id"],
    )

    second_response = client.post(
        "/hosts",
        json={
            "name": "Second Host",
            "ip_address": "1.1.1.1",
            "description": "Second recommendation test host",
        },
    )

    assert second_response.status_code == 201

    second_host = second_response.json()

    response = client.get(
        (
            f"/hosts/{second_host['id']}"
            f"/predictions/{prediction['id']}"
            "/recommendations"
        )
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": (
            "Prediction not found for this host."
        )
    }