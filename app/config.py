"""PredictIQ configuration module using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables or .env file."""

    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/predictiq"
    )
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_TITLE: str = "PredictIQ - Hospital Operations Intelligence"
    APP_VERSION: str = "1.0.0"
    PAGE_SIZE_DEFAULT: int = 20
    PAGE_SIZE_MAX: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
