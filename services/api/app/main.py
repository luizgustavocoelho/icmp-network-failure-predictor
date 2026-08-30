from fastapi import FastAPI

from app.database import Base, engine
from app.models import Host, Measurement
from app.routers.hosts import router as hosts_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ICMP Network Failure Predictor API",
    description="REST API for network monitoring, analysis and connectivity prediction.",
    version="0.1.0",
)


app.include_router(hosts_router)


@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "ok",
        "service": "icmp-network-failure-predictor-api",
    }