from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.host import Host
from app.models.measurement import Measurement
from app.schemas.host import HostCreate, HostResponse, HostUpdate
from app.schemas.measurement import MeasurementResponse
from app.services.icmp_monitor import ping_host
from app.services.measurement_service import save_measurement

router = APIRouter(
    prefix="/hosts",
    tags=["Hosts"],
)


@router.post(
    "",
    response_model=HostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_host(
    host_data: HostCreate,
    db: Session = Depends(get_db),
):
    host = Host(
        name=host_data.name,
        ip_address=str(host_data.ip_address),
        description=host_data.description,
    )

    db.add(host)

    try:
        db.commit()
        db.refresh(host)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A host with this IP address already exists.",
        )

    return host


@router.get(
    "",
    response_model=list[HostResponse],
)
def list_hosts(
    db: Session = Depends(get_db),
):
    query = select(Host).order_by(Host.id)

    hosts = db.scalars(query).all()

    return hosts


@router.get(
    "/{host_id}",
    response_model=HostResponse,
)
def get_host(
    host_id: int,
    db: Session = Depends(get_db),
):
    host = db.get(Host, host_id)

    if host is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found.",
        )

    return host


@router.put(
    "/{host_id}",
    response_model=HostResponse,
)
def update_host(
    host_id: int,
    host_data: HostUpdate,
    db: Session = Depends(get_db),
):
    host = db.get(Host, host_id)

    if host is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found.",
        )

    host.name = host_data.name
    host.ip_address = str(host_data.ip_address)
    host.description = host_data.description
    host.is_active = host_data.is_active

    try:
        db.commit()
        db.refresh(host)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A host with this IP address already exists.",
        )

    return host


@router.post(
    "/{host_id}/measure",
    response_model=MeasurementResponse,
    status_code=status.HTTP_201_CREATED,
)
def measure_host(
    host_id: int,
    db: Session = Depends(get_db),
):
    host = db.get(Host, host_id)

    if host is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found.",
        )

    if not host.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Host is inactive.",
        )

    icmp_measurement = ping_host(
        host=str(host.ip_address),
    )

    measurement = save_measurement(
        db=db,
        host_id=host.id,
        icmp_measurement=icmp_measurement,
    )

    return measurement


@router.get(
    "/{host_id}/measurements",
    response_model=list[MeasurementResponse],
)
def list_host_measurements(
    host_id: int,
    db: Session = Depends(get_db),
):
    host = db.get(Host, host_id)

    if host is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found.",
        )

    query = (
        select(Measurement)
        .where(Measurement.host_id == host_id)
        .order_by(Measurement.measured_at.desc())
    )

    measurements = db.scalars(query).all()

    return measurements