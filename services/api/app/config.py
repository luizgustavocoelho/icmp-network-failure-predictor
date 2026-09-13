from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


API_DIRECTORY = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

ENV_FILE = API_DIRECTORY / ".env"


class Settings(BaseSettings):
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str

    auto_monitor_enabled: bool = False

    auto_monitor_interval_seconds: float = Field(
        default=60.0,
        gt=0,
    )

    auto_monitor_ping_count: int = Field(
        default=4,
        gt=0,
    )

    auto_monitor_timeout_ms: int = Field(
        default=1000,
        gt=0,
    )

    auth_jwt_secret: str

    auth_jwt_algorithm: str = "HS256"

    auth_access_token_expire_minutes: int = Field(
        default=1440,
        gt=0,
    )

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://"
            f"{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()