import logging
import threading

from sqlalchemy import select

from app.database import SessionLocal
from app.models.host import Host
from app.services.icmp_monitor import ping_host
from app.services.measurement_service import save_measurement


logger = logging.getLogger(__name__)


class MonitoringScheduler:
    def __init__(
        self,
        *,
        enabled: bool,
        interval_seconds: float,
        ping_count: int,
        timeout_ms: int,
    ) -> None:
        self.enabled = enabled
        self.interval_seconds = interval_seconds
        self.ping_count = ping_count
        self.timeout_ms = timeout_ms

        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()

    @property
    def is_running(self) -> bool:
        return (
            self._thread is not None
            and self._thread.is_alive()
        )

    def start(self) -> None:
        if not self.enabled:
            logger.info(
                "Automatic monitoring is disabled."
            )
            return

        with self._lock:
            if self.is_running:
                logger.warning(
                    "Automatic monitoring is already running."
                )
                return

            self._stop_event.clear()

            self._thread = threading.Thread(
                target=self._run_loop,
                name="icmp-auto-monitor",
                daemon=True,
            )

            self._thread.start()

        logger.info(
            "Automatic monitoring started. "
            "Interval: %s seconds.",
            self.interval_seconds,
        )

    def stop(self) -> None:
        with self._lock:
            thread = self._thread

            if thread is None:
                return

            self._stop_event.set()

        if thread.is_alive():
            thread.join(timeout=10)

        with self._lock:
            if not thread.is_alive():
                self._thread = None

        logger.info(
            "Automatic monitoring stopped."
        )

    def run_cycle_once(self) -> int:
        monitored_hosts = 0

        with SessionLocal() as db:
            query = (
                select(
                    Host.id,
                    Host.name,
                    Host.ip_address,
                )
                .where(
                    Host.is_active.is_(True)
                )
                .order_by(Host.id)
            )

            hosts = db.execute(query).all()

            if not hosts:
                logger.info(
                    "Automatic monitoring cycle: "
                    "no active hosts found."
                )
                return 0

            logger.info(
                "Automatic monitoring cycle started "
                "for %s active host(s).",
                len(hosts),
            )

            for host_id, host_name, ip_address in hosts:
                if self._stop_event.is_set():
                    break

                try:
                    icmp_measurement = ping_host(
                        host=str(ip_address),
                        count=self.ping_count,
                        timeout_ms=self.timeout_ms,
                    )

                    measurement = save_measurement(
                        db=db,
                        host_id=host_id,
                        icmp_measurement=icmp_measurement,
                    )

                    monitored_hosts += 1

                    logger.info(
                        (
                            "Automatic measurement completed: "
                            "host=%s "
                            "ip=%s "
                            "status=%s "
                            "latency_ms=%s "
                            "packet_loss_pct=%s"
                        ),
                        host_name,
                        ip_address,
                        measurement.status,
                        measurement.latency_ms,
                        measurement.packet_loss_pct,
                    )

                except Exception:
                    db.rollback()

                    logger.exception(
                        (
                            "Automatic measurement failed: "
                            "host=%s ip=%s"
                        ),
                        host_name,
                        ip_address,
                    )

        return monitored_hosts

    def _run_loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                self.run_cycle_once()

            except Exception:
                logger.exception(
                    "Unexpected automatic monitoring cycle error."
                )

            if self._stop_event.wait(
                self.interval_seconds
            ):
                break