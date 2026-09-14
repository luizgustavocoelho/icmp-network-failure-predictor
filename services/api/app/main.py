import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import Base, engine
from app.models import (
    Alert,
    Host,
    Measurement,
    Prediction,
    User,
)
from app.routers.auth import router as auth_router
from app.routers.hosts import router as hosts_router
from app.services.monitoring_scheduler import (
    MonitoringScheduler,
)


logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s | %(levelname)s | "
        "%(name)s | %(message)s"
    ),
)


Base.metadata.create_all(bind=engine)


monitoring_scheduler = MonitoringScheduler(
    enabled=settings.auto_monitor_enabled,
    interval_seconds=(
        settings.auto_monitor_interval_seconds
    ),
    ping_count=settings.auto_monitor_ping_count,
    timeout_ms=settings.auto_monitor_timeout_ms,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    monitoring_scheduler.start()

    try:
        yield

    finally:
        monitoring_scheduler.stop()


app = FastAPI(
    title="ICMP Network Failure Predictor API",
    description=(
        "REST API for network monitoring, "
        "analysis and connectivity prediction."
    ),
    version="0.3.0",
    lifespan=lifespan,
)


app.include_router(auth_router)
app.include_router(hosts_router)


@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "ok",
        "service": (
            "icmp-network-failure-predictor-api"
        ),
        "version": "0.3.0",
        "automatic_monitoring": {
            "enabled": (
                settings.auto_monitor_enabled
            ),
            "running": (
                monitoring_scheduler.is_running
            ),
            "interval_seconds": (
                settings.auto_monitor_interval_seconds
            ),
            "ping_count": (
                settings.auto_monitor_ping_count
            ),
            "timeout_ms": (
                settings.auto_monitor_timeout_ms
            ),
        },
    }