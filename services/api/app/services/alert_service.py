from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.measurement import Measurement
from app.services.network_classifier import NetworkStatus


def create_alert_for_measurement(
    db: Session,
    measurement: Measurement,
) -> Alert | None:
    if measurement.status == NetworkStatus.RISK.value:
        alert = Alert(
            host_id=measurement.host_id,
            measurement_id=measurement.id,
            severity="warning",
            message="Network degradation detected.",
        )

    elif measurement.status == NetworkStatus.FAILURE.value:
        alert = Alert(
            host_id=measurement.host_id,
            measurement_id=measurement.id,
            severity="critical",
            message="Network failure detected.",
        )

    else:
        return None

    db.add(alert)

    return alert