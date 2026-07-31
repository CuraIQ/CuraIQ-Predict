"""PredictIQ configuration module using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables or .env file."""

    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_TITLE: str = "PredictIQ - Hospital Operations Intelligence"
    APP_VERSION: str = "1.0.0"
    PAGE_SIZE_DEFAULT: int = 20
    PAGE_SIZE_MAX: int = 100

    GEMINI_KEY_1: str | None = None
    GEMINI_KEY_2: str | None = None
    GEMINI_KEY_3: str | None = None
    GEMINI_KEY_4: str | None = None
    PORT: int = 8000

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
