from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.alert import Alert
from app.models.host import Host
from app.models.measurement import Measurement
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.alert import AlertResponse
from app.schemas.host import (
    HostCreate,
    HostResponse,
    HostUpdate,
)
from app.schemas.measurement import (
    MeasurementResponse,
    MeasurementSummaryResponse,
)
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
)
from app.schemas.recommendation import (
    ActivityRecommendationResponse,
    RecommendationResponse,
)
from app.services.icmp_monitor import ping_host
from app.services.measurement_service import (
    save_measurement,
)
from app.services.network_classifier import (
    NetworkStatus,
)
from app.services.prediction_service import (
    generate_prediction,
)
from app.services.recommendation_service import (
    generate_activity_recommendations,
)


router = APIRouter(
    prefix="/hosts",
    tags=["Hosts"],
)


def get_owned_host(
    *,
    db: Session,
    host_id: int,
    user_id: int,
) -> Host:
    query = select(Host).where(
        Host.id == host_id,
        Host.user_id == user_id,
    )

    host = db.scalar(query)

    if host is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found.",
        )

    return host


@router.post(
    "",
    response_model=HostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_host(
    host_data: HostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    host = Host(
        user_id=current_user.id,
        name=host_data.name,
        ip_address=str(
            host_data.ip_address
        ),
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
            detail=(
                "A host with this IP address "
                "already exists."
            ),
        )

    return host


@router.get(
    "",
    response_model=list[HostResponse],
)
def list_hosts(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    query = (
        select(Host)
        .where(
            Host.user_id
            == current_user.id
        )
        .order_by(Host.id)
    )

    hosts = db.scalars(
        query
    ).all()

    return hosts


@router.get(
    "/{host_id}",
    response_model=HostResponse,
)
def get_host(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )


@router.put(
    "/{host_id}",
    response_model=HostResponse,
)
def update_host(
    host_id: int,
    host_data: HostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    host = get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    host.name = host_data.name

    host.ip_address = str(
        host_data.ip_address
    )

    host.description = (
        host_data.description
    )

    host.is_active = (
        host_data.is_active
    )

    try:
        db.commit()
        db.refresh(host)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A host with this IP address "
                "already exists."
            ),
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
    current_user: User = Depends(
        get_current_user
    ),
):
    host = get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    if not host.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Host is inactive.",
        )

    icmp_measurement = ping_host(
        host=str(
            host.ip_address
        ),
    )

    measurement = save_measurement(
        db=db,
        host_id=host.id,
        icmp_measurement=(
            icmp_measurement
        ),
    )

    return measurement


@router.get(
    "/{host_id}/measurements",
    response_model=list[
        MeasurementResponse
    ],
)
def list_host_measurements(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
    network_status: NetworkStatus | None = Query(
        default=None,
        alias="status",
    ),
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    if (
        start_at is not None
        and end_at is not None
        and start_at > end_at
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "start_at cannot be later "
                "than end_at."
            ),
        )

    query = select(
        Measurement
    ).where(
        Measurement.host_id
        == host_id
    )

    if network_status is not None:
        query = query.where(
            Measurement.status
            == network_status.value
        )

    if start_at is not None:
        query = query.where(
            Measurement.measured_at
            >= start_at
        )

    if end_at is not None:
        query = query.where(
            Measurement.measured_at
            <= end_at
        )

    query = (
        query
        .order_by(
            Measurement.measured_at.desc()
        )
        .limit(limit)
    )

    measurements = db.scalars(
        query
    ).all()

    return measurements


@router.get(
    "/{host_id}/measurements/summary",
    response_model=(
        MeasurementSummaryResponse
    ),
)
def get_measurement_summary(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    query = select(
        func.count(
            Measurement.id
        ).label(
            "total_measurements"
        ),
        func.avg(
            Measurement.latency_ms
        ).label(
            "average_latency_ms"
        ),
        func.min(
            Measurement.latency_ms
        ).label(
            "minimum_latency_ms"
        ),
        func.max(
            Measurement.latency_ms
        ).label(
            "maximum_latency_ms"
        ),
        func.avg(
            Measurement.packet_loss_pct
        ).label(
            "average_packet_loss_pct"
        ),
        func.count(
            Measurement.id
        )
        .filter(
            Measurement.status == "OK"
        )
        .label("ok_count"),
        func.count(
            Measurement.id
        )
        .filter(
            Measurement.status == "RISK"
        )
        .label("risk_count"),
        func.count(
            Measurement.id
        )
        .filter(
            Measurement.status
            == "FAILURE"
        )
        .label("failure_count"),
    ).where(
        Measurement.host_id
        == host_id
    )

    result = db.execute(
        query
    ).one()

    return MeasurementSummaryResponse(
        host_id=host_id,
        total_measurements=(
            result.total_measurements
        ),
        average_latency_ms=(
            float(
                result.average_latency_ms
            )
            if (
                result.average_latency_ms
                is not None
            )
            else None
        ),
        minimum_latency_ms=(
            float(
                result.minimum_latency_ms
            )
            if (
                result.minimum_latency_ms
                is not None
            )
            else None
        ),
        maximum_latency_ms=(
            float(
                result.maximum_latency_ms
            )
            if (
                result.maximum_latency_ms
                is not None
            )
            else None
        ),
        average_packet_loss_pct=(
            float(
                result.average_packet_loss_pct
            )
            if (
                result.average_packet_loss_pct
                is not None
            )
            else None
        ),
        ok_count=result.ok_count,
        risk_count=result.risk_count,
        failure_count=(
            result.failure_count
        ),
    )


@router.get(
    "/{host_id}/alerts",
    response_model=list[
        AlertResponse
    ],
)
def list_host_alerts(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    query = (
        select(Alert)
        .where(
            Alert.host_id
            == host_id
        )
        .order_by(
            Alert.created_at.desc()
        )
        .limit(limit)
    )

    alerts = db.scalars(
        query
    ).all()

    return alerts


@router.post(
    "/{host_id}/prediction",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
def predict_host_condition(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    try:
        prediction = generate_prediction(
            db=db,
            host_id=host_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=str(exc),
        ) from exc

    return prediction


@router.get(
    "/{host_id}/predictions",
    response_model=list[
        PredictionResponse
    ],
)
def list_host_predictions(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    if (
        start_at is not None
        and end_at is not None
        and start_at > end_at
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "start_at cannot be later "
                "than end_at."
            ),
        )

    query = select(
        Prediction
    ).where(
        Prediction.host_id
        == host_id
    )

    if start_at is not None:
        query = query.where(
            Prediction.forecast_for
            >= start_at
        )

    if end_at is not None:
        query = query.where(
            Prediction.forecast_for
            <= end_at
        )

    query = (
        query
        .order_by(
            Prediction.forecast_for.asc()
        )
        .limit(limit)
    )

    predictions = db.scalars(
        query
    ).all()

    return predictions


@router.get(
    "/{host_id}/predictions/latest",
    response_model=PredictionResponse,
)
def get_latest_host_prediction(
    host_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    query = (
        select(Prediction)
        .where(
            Prediction.host_id
            == host_id
        )
        .order_by(
            Prediction.generated_at.desc()
        )
        .limit(1)
    )

    prediction = db.scalars(
        query
    ).first()

    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No predictions found "
                "for this host."
            ),
        )

    return prediction


@router.post(
    "/{host_id}/predictions/forecast",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
def predict_host_condition_at_time(
    host_id: int,
    prediction_request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    try:
        prediction = generate_prediction(
            db=db,
            host_id=host_id,
            forecast_for=(
                prediction_request.forecast_for
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=str(exc),
        ) from exc

    return prediction


@router.get(
    (
        "/{host_id}/predictions/"
        "{prediction_id}/recommendations"
    ),
    response_model=RecommendationResponse,
)
def get_activity_recommendations(
    host_id: int,
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    get_owned_host(
        db=db,
        host_id=host_id,
        user_id=current_user.id,
    )

    prediction = db.get(
        Prediction,
        prediction_id,
    )

    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found.",
        )

    if (
        prediction.host_id
        != host_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Prediction not found "
                "for this host."
            ),
        )

    prediction_status = NetworkStatus(
        prediction.predicted_status
    )

    recommendations = (
        generate_activity_recommendations(
            network_status=(
                prediction_status
            ),
        )
    )

    return RecommendationResponse(
        host_id=host_id,
        prediction_id=prediction.id,
        predicted_status=(
            prediction_status
        ),
        recommendations=[
            ActivityRecommendationResponse(
                activity=(
                    recommendation.activity
                ),
                suitability=(
                    recommendation.suitability
                ),
                message=(
                    recommendation.message
                ),
            )
            for recommendation
            in recommendations
        ],
    )