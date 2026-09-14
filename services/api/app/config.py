from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


API_DIRECTORY = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

ENV_FILE = API_DIRECTORY / ".env"


class Settings(BaseSettings):
    database_url: str | None = None

    db_host: str | None = None
    db_port: int | None = None
    db_name: str | None = None
    db_user: str | None = None
    db_password: str | None = None

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
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            url = self.database_url.strip()

            if url.startswith(
                "postgresql+psycopg://"
            ):
                return url

            if url.startswith(
                "postgresql://"
            ):
                return url.replace(
                    "postgresql://",
                    "postgresql+psycopg://",
                    1,
                )

            if url.startswith(
                "postgres://"
            ):
                return url.replace(
                    "postgres://",
                    "postgresql+psycopg://",
                    1,
                )

            raise ValueError(
                "DATABASE_URL must use a "
                "PostgreSQL connection string."
            )

        local_values = {
            "DB_HOST": self.db_host,
            "DB_PORT": self.db_port,
            "DB_NAME": self.db_name,
            "DB_USER": self.db_user,
            "DB_PASSWORD": self.db_password,
        }

        missing = [
            key
            for key, value
            in local_values.items()
            if value is None
        ]

        if missing:
            raise ValueError(
                "Database configuration is missing. "
                "Set DATABASE_URL or provide: "
                + ", ".join(missing)
            )

        username = quote_plus(
            str(self.db_user)
        )

        password = quote_plus(
            str(self.db_password)
        )

        return (
            "postgresql+psycopg://"
            f"{username}:{password}"
            f"@{self.db_host}:{self.db_port}"
            f"/{self.db_name}"
        )


settings = Settings()