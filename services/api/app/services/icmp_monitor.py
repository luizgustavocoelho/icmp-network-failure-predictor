import platform
import re
import subprocess
import time

from dataclasses import dataclass
from datetime import datetime, timezone
from statistics import mean
from collections.abc import Generator


LATENCY_PATTERN = re.compile(
    r"(?:time|tempo)[=<]\s*([0-9]+(?:[.,][0-9]+)?)\s*ms",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class ICMPMeasurement:
    host: str
    measured_at: datetime
    latency_ms: float | None
    packet_loss_pct: float
    success: bool
    packets_sent: int
    packets_received: int


def _build_ping_command(
    host: str,
    timeout_ms: int,
) -> list[str]:
    system = platform.system().lower()

    if system == "windows":
        return [
            "ping",
            "-n",
            "1",
            "-w",
            str(timeout_ms),
            host,
        ]

    if system == "linux":
        timeout_seconds = max(
            1,
            round(timeout_ms / 1000),
        )

        return [
            "ping",
            "-c",
            "1",
            "-W",
            str(timeout_seconds),
            host,
        ]

    if system == "darwin":
        return [
            "ping",
            "-c",
            "1",
            "-W",
            str(timeout_ms),
            host,
        ]

    raise RuntimeError(
        f"Unsupported operating system: {system}"
    )


def _extract_latency(
    output: str,
) -> float | None:
    match = LATENCY_PATTERN.search(output)

    if match is None:
        return None

    latency_value = (
        match
        .group(1)
        .replace(",", ".")
    )

    return float(latency_value)


def ping_host(
    host: str,
    count: int = 4,
    timeout_ms: int = 1000,
) -> ICMPMeasurement:
    if count <= 0:
        raise ValueError(
            "Ping count must be greater than zero."
        )

    if timeout_ms <= 0:
        raise ValueError(
            "Timeout must be greater than zero."
        )

    latencies: list[float] = []
    packets_received = 0

    measured_at = datetime.now(
        timezone.utc
    )

    for _ in range(count):
        command = _build_ping_command(
            host=host,
            timeout_ms=timeout_ms,
        )

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            errors="replace",
            check=False,
        )

        output = (
            result.stdout
            + "\n"
            + result.stderr
        )

        if result.returncode == 0:
            packets_received += 1

            latency = _extract_latency(
                output
            )

            if latency is not None:
                latencies.append(latency)

    packets_lost = (
        count - packets_received
    )

    packet_loss_pct = (
        packets_lost / count
    ) * 100

    average_latency = (
        round(mean(latencies), 3)
        if latencies
        else None
    )

    return ICMPMeasurement(
        host=host,
        measured_at=measured_at,
        latency_ms=average_latency,
        packet_loss_pct=round(
            packet_loss_pct,
            2,
        ),
        success=packets_received > 0,
        packets_sent=count,
        packets_received=packets_received,
    )


def monitor_host_periodically(
    host: str,
    interval_seconds: float = 60,
    count: int = 4,
    timeout_ms: int = 1000,
    iterations: int | None = None,
) -> Generator[ICMPMeasurement, None, None]:
    if interval_seconds <= 0:
        raise ValueError(
            "Monitoring interval must be greater than zero."
        )

    if iterations is not None and iterations <= 0:
        raise ValueError(
            "Iterations must be greater than zero."
        )

    completed_iterations = 0

    while (
        iterations is None
        or completed_iterations < iterations
    ):
        measurement = ping_host(
            host=host,
            count=count,
            timeout_ms=timeout_ms,
        )

        yield measurement

        completed_iterations += 1

        should_continue = (
            iterations is None
            or completed_iterations < iterations
        )

        if should_continue:
            time.sleep(interval_seconds)