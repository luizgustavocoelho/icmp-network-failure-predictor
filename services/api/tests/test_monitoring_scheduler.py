from types import SimpleNamespace

import app.services.monitoring_scheduler as scheduler_module
from app.services.monitoring_scheduler import MonitoringScheduler


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class FakeSession:
    def __init__(self, rows):
        self.rows = rows
        self.rollback_calls = 0

    def __enter__(self):
        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ):
        return False

    def execute(self, query):
        return FakeResult(self.rows)

    def rollback(self):
        self.rollback_calls += 1


def build_scheduler(
    *,
    enabled=True,
):
    return MonitoringScheduler(
        enabled=enabled,
        interval_seconds=15,
        ping_count=4,
        timeout_ms=1000,
    )


def test_disabled_scheduler_does_not_start():
    scheduler = build_scheduler(
        enabled=False,
    )

    scheduler.start()

    assert scheduler.is_running is False


def test_monitoring_cycle_returns_zero_when_no_hosts(
    monkeypatch,
):
    fake_session = FakeSession(
        rows=[],
    )

    monkeypatch.setattr(
        scheduler_module,
        "SessionLocal",
        lambda: fake_session,
    )

    scheduler = build_scheduler()

    monitored_hosts = scheduler.run_cycle_once()

    assert monitored_hosts == 0
    assert fake_session.rollback_calls == 0


def test_monitoring_cycle_measures_active_host(
    monkeypatch,
):
    fake_session = FakeSession(
        rows=[
            (
                1,
                "Google DNS",
                "8.8.8.8",
            ),
        ],
    )

    monkeypatch.setattr(
        scheduler_module,
        "SessionLocal",
        lambda: fake_session,
    )

    ping_calls = []
    save_calls = []

    fake_icmp_measurement = SimpleNamespace(
        host="8.8.8.8",
        latency_ms=5.0,
        packet_loss_pct=0.0,
        success=True,
    )

    def fake_ping_host(
        host,
        count,
        timeout_ms,
    ):
        ping_calls.append(
            {
                "host": host,
                "count": count,
                "timeout_ms": timeout_ms,
            }
        )

        return fake_icmp_measurement

    def fake_save_measurement(
        db,
        host_id,
        icmp_measurement,
    ):
        save_calls.append(
            {
                "db": db,
                "host_id": host_id,
                "icmp_measurement": (
                    icmp_measurement
                ),
            }
        )

        return SimpleNamespace(
            status="OK",
            latency_ms=5.0,
            packet_loss_pct=0.0,
        )

    monkeypatch.setattr(
        scheduler_module,
        "ping_host",
        fake_ping_host,
    )

    monkeypatch.setattr(
        scheduler_module,
        "save_measurement",
        fake_save_measurement,
    )

    scheduler = build_scheduler()

    monitored_hosts = scheduler.run_cycle_once()

    assert monitored_hosts == 1

    assert ping_calls == [
        {
            "host": "8.8.8.8",
            "count": 4,
            "timeout_ms": 1000,
        }
    ]

    assert len(save_calls) == 1

    assert (
        save_calls[0]["host_id"]
        == 1
    )

    assert (
        save_calls[0]["db"]
        is fake_session
    )

    assert (
        save_calls[0]["icmp_measurement"]
        is fake_icmp_measurement
    )

    assert fake_session.rollback_calls == 0


def test_monitoring_cycle_continues_after_host_failure(
    monkeypatch,
):
    fake_session = FakeSession(
        rows=[
            (
                1,
                "Broken Host",
                "192.0.2.1",
            ),
            (
                2,
                "Google DNS",
                "8.8.8.8",
            ),
        ],
    )

    monkeypatch.setattr(
        scheduler_module,
        "SessionLocal",
        lambda: fake_session,
    )

    pinged_hosts = []
    saved_host_ids = []

    def fake_ping_host(
        host,
        count,
        timeout_ms,
    ):
        pinged_hosts.append(host)

        if host == "192.0.2.1":
            raise RuntimeError(
                "Simulated monitoring error."
            )

        return SimpleNamespace(
            host=host,
            latency_ms=5.0,
            packet_loss_pct=0.0,
            success=True,
        )

    def fake_save_measurement(
        db,
        host_id,
        icmp_measurement,
    ):
        saved_host_ids.append(host_id)

        return SimpleNamespace(
            status="OK",
            latency_ms=5.0,
            packet_loss_pct=0.0,
        )

    monkeypatch.setattr(
        scheduler_module,
        "ping_host",
        fake_ping_host,
    )

    monkeypatch.setattr(
        scheduler_module,
        "save_measurement",
        fake_save_measurement,
    )

    scheduler = build_scheduler()

    monitored_hosts = scheduler.run_cycle_once()

    assert monitored_hosts == 1

    assert pinged_hosts == [
        "192.0.2.1",
        "8.8.8.8",
    ]

    assert saved_host_ids == [
        2,
    ]

    assert fake_session.rollback_calls == 1