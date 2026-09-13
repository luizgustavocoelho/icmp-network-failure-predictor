import os

import pytest
from dotenv import load_dotenv


# Load test-specific environment variables first.
load_dotenv(".env.test", override=True)

# The automatic background monitor must never run during tests.
os.environ["AUTO_MONITOR_ENABLED"] = "false"


from fastapi.testclient import TestClient
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import Base, get_db
from app.main import app, monitoring_scheduler
from app.models.alert import Alert
from app.models.host import Host
from app.models.measurement import Measurement
from app.models.prediction import Prediction


# Extra protection:
# even if the application/settings were imported earlier by pytest,
# force monitoring off for the entire test process.
settings.auto_monitor_enabled = False
monitoring_scheduler.enabled = False


TEST_DATABASE_URL = (
    f"postgresql+psycopg://"
    f"{os.getenv('TEST_DB_USER')}:{os.getenv('TEST_DB_PASSWORD')}"
    f"@{os.getenv('TEST_DB_HOST')}:{os.getenv('TEST_DB_PORT')}"
    f"/{os.getenv('TEST_DB_NAME')}"
)


test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
)


TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="session", autouse=True)
def prepare_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(autouse=True)
def clean_database():
    with Session(test_engine) as db:
        db.execute(delete(Alert))
        db.execute(delete(Prediction))
        db.execute(delete(Measurement))
        db.execute(delete(Host))
        db.commit()


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    # Guarantee the background monitor remains disabled
    # before FastAPI's lifespan starts.
    settings.auto_monitor_enabled = False
    monitoring_scheduler.enabled = False

    with TestClient(app) as test_client:
        yield test_client