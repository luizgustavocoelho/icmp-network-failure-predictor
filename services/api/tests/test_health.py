def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ok"
    assert data["service"] == "icmp-network-failure-predictor-api"
    assert data["version"] == "0.2.0"

    automatic_monitoring = data["automatic_monitoring"]

    assert automatic_monitoring["enabled"] is False
    assert automatic_monitoring["running"] is False

    assert (
        automatic_monitoring["interval_seconds"]
        > 0
    )

    assert (
        automatic_monitoring["ping_count"]
        > 0
    )

    assert (
        automatic_monitoring["timeout_ms"]
        > 0
    )