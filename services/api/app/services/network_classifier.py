from enum import StrEnum


class NetworkStatus(StrEnum):
    OK = "OK"
    RISK = "RISK"
    FAILURE = "FAILURE"


MAX_OK_RTT_MS = 300.0
MAX_OK_PACKET_LOSS_PCT = 1.0
TOTAL_PACKET_LOSS_PCT = 100.0


def classify_network_condition(
    latency_ms: float | None,
    packet_loss_pct: float,
    success: bool,
) -> NetworkStatus:
    if packet_loss_pct < 0 or packet_loss_pct > 100:
        raise ValueError(
            "Packet loss must be between 0 and 100."
        )

    if latency_ms is not None and latency_ms < 0:
        raise ValueError(
            "Latency cannot be negative."
        )

    if (
        not success
        or packet_loss_pct >= TOTAL_PACKET_LOSS_PCT
    ):
        return NetworkStatus.FAILURE

    if latency_ms is None:
        return NetworkStatus.RISK

    if (
        latency_ms >= MAX_OK_RTT_MS
        or packet_loss_pct >= MAX_OK_PACKET_LOSS_PCT
    ):
        return NetworkStatus.RISK

    return NetworkStatus.OK