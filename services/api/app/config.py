from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://"
            f"{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()