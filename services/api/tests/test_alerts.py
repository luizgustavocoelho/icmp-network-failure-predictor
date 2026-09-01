from datetime import datetime, timezone

from app.routers import hosts as hosts_router
from app.services.icmp_monitor import ICMPMeasurement


def create_test_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Test Host",
            "ip_address": "8.8.8.8",
            "description": "Host used for alert tests",
        },
    )

    assert response.status_code == 201

    return response.json()


def test_ok_measurement_does_not_generate_alert(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=datetime.now(timezone.utc),
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

    response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    assert response.status_code == 201
    assert response.json()["status"] == "OK"

    alerts_response = client.get(
        f"/hosts/{host['id']}/alerts"
    )

    assert alerts_response.status_code == 200
    assert alerts_response.json() == []


def test_risk_measurement_generates_warning_alert(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=datetime.now(timezone.utc),
        latency_ms=350.0,
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

    measure_response = client.post(
        f"/hosts/{host['id']}/measure"
    )

    assert measure_response.status_code == 201
    assert measure_response.json()["status"] == "RISK"

    alerts_response = client.get(
        f"/hosts/{host['id']}/alerts"
    )

    assert alerts_response.status_code == 200

    alerts = alerts_response.json()

    assert len(alerts) == 1
    assert alerts[0]["severity"] == "warning"
    assert alerts[0]["message"] == (
        "Network degradation detected."
    )
    assert alerts[0]["is_read"] is False
    assert alerts[0]["measurement_id"] is not None


def test_failure_measurement_generates_critical_alert(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=datetime.now(timezone.utc),
        latency_ms=None,
        packet_loss_pct=100.0,
        success=False,
        packets_sent=4,
        packets_received=0,
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
    assert measure_response.json()["status"] == "FAILURE"

    alerts_response = client.get(
        f"/hosts/{host['id']}/alerts"
    )

    assert alerts_response.status_code == 200

    alerts = alerts_response.json()

    assert len(alerts) == 1
    assert alerts[0]["severity"] == "critical"
    assert alerts[0]["message"] == (
        "Network failure detected."
    )
    assert alerts[0]["is_read"] is False


def test_alert_references_generated_measurement(
    client,
    monkeypatch,
):
    host = create_test_host(client)

    fake_measurement = ICMPMeasurement(
        host="8.8.8.8",
        measured_at=datetime.now(timezone.utc),
        latency_ms=400.0,
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

    measurement = measure_response.json()

    alerts_response = client.get(
        f"/hosts/{host['id']}/alerts"
    )

    alert = alerts_response.json()[0]

    assert alert["host_id"] == host["id"]
    assert alert["measurement_id"] == measurement["id"]


def test_alerts_for_nonexistent_host(client):
    response = client.get(
        "/hosts/999999/alerts"
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }