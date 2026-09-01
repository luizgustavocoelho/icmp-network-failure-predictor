from datetime import datetime, timedelta, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Forecast Selection Host",
            "ip_address": "8.8.8.8",
            "description": "Host used for forecast selection tests",
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


def test_prediction_can_be_generated_for_selected_time(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    forecast_for = (
        datetime.now(timezone.utc)
        + timedelta(hours=1)
    )

    response = client.post(
        f"/hosts/{host['id']}/predictions/forecast",
        json={
            "forecast_for": forecast_for.isoformat(),
        },
    )

    assert response.status_code == 201

    prediction = response.json()

    returned_forecast = datetime.fromisoformat(
        prediction["forecast_for"]
    )

    assert returned_forecast == forecast_for


def test_past_forecast_time_is_rejected(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    forecast_for = (
        datetime.now(timezone.utc)
        - timedelta(hours=1)
    )

    response = client.post(
        f"/hosts/{host['id']}/predictions/forecast",
        json={
            "forecast_for": forecast_for.isoformat(),
        },
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": "forecast_for must be in the future."
    }


def test_timezone_is_required(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    forecast_for = (
        datetime.now()
        + timedelta(hours=1)
    )

    response = client.post(
        f"/hosts/{host['id']}/predictions/forecast",
        json={
            "forecast_for": forecast_for.isoformat(),
        },
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": (
            "forecast_for must include timezone information."
        )
    }


def test_predictions_can_be_filtered_by_period(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    create_measurement_history(
        client,
        monkeypatch,
        host["id"],
    )

    now = datetime.now(timezone.utc)

    forecast_times = [
        now + timedelta(hours=1),
        now + timedelta(hours=2),
        now + timedelta(hours=3),
    ]

    for forecast_for in forecast_times:
        response = client.post(
            f"/hosts/{host['id']}/predictions/forecast",
            json={
                "forecast_for": forecast_for.isoformat(),
            },
        )

        assert response.status_code == 201

    response = client.get(
        f"/hosts/{host['id']}/predictions",
        params={
            "start_at": (
                now + timedelta(hours=1, minutes=30)
            ).isoformat(),
            "end_at": (
                now + timedelta(hours=2, minutes=30)
            ).isoformat(),
        },
    )

    assert response.status_code == 200

    predictions = response.json()

    assert len(predictions) == 1

    returned_forecast = datetime.fromisoformat(
        predictions[0]["forecast_for"]
    )

    assert returned_forecast == forecast_times[1]


def test_invalid_prediction_period_is_rejected(
    client,
):
    host = create_test_host(client)

    now = datetime.now(timezone.utc)

    response = client.get(
        f"/hosts/{host['id']}/predictions",
        params={
            "start_at": (
                now + timedelta(hours=3)
            ).isoformat(),
            "end_at": (
                now + timedelta(hours=1)
            ).isoformat(),
        },
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": "start_at cannot be later than end_at."
    }