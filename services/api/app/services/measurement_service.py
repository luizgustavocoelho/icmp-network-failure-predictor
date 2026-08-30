from sqlalchemy.orm import Session

from app.models.measurement import Measurement
from app.services.icmp_monitor import ICMPMeasurement


def save_measurement(
    db: Session,
    host_id: int,
    icmp_measurement: ICMPMeasurement,
) -> Measurement:
    measurement = Measurement(
        host_id=host_id,
        measured_at=icmp_measurement.measured_at,
        latency_ms=icmp_measurement.latency_ms,
        packet_loss_pct=icmp_measurement.packet_loss_pct,
        success=icmp_measurement.success,
        status=None,
    )

    db.add(measurement)
    db.commit()
    db.refresh(measurement)

    return measurement