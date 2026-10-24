"""
App configuration.

Every setting can be overridden with an environment variable (or a .env file),
so the same code runs locally on SQLite and in production on PostgreSQL
without any code change -- only the env vars differ.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Local default is a SQLite file. In production set DATABASE_URL to a Postgres URL.
    database_url: str = "sqlite:///./car_dealership.db"

    # JWT settings. ALWAYS override jwt_secret in production.
    jwt_secret: str = "dev-only-change-me-please-32-bytes-min"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # one day

    # Comma-separated emails that become admins when they register.
    admin_emails: str = ""

    # Comma-separated list of frontend URLs allowed to call this API (CORS).
    cors_origins: str = "http://localhost:5173"

    @property
    def admin_email_set(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails.split(",") if e.strip()}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        """
        Hosting providers hand out URLs like `postgres://...` or `postgresql://...`.
        SQLAlchemy needs to be told which driver to use, so we normalise it to psycopg (v3).
        """
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
