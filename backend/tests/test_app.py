"""Tests for app-level wiring: config parsing, health check, edge-case auth."""
import pytest

from app.config import Settings
from app.security import create_access_token


@pytest.mark.parametrize(
    "given,expected",
    [
        ("postgres://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
        ("postgresql://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
        ("sqlite:///./x.db", "sqlite:///./x.db"),
    ],
)
def test_database_url_is_normalised_for_psycopg(given, expected):
    assert Settings(database_url=given).sqlalchemy_url == expected


def test_admin_emails_and_cors_are_parsed_from_csv():
    s = Settings(admin_emails=" A@x.com, b@y.com ,", cors_origins="http://a.com, http://b.com")
    assert s.admin_email_set == {"a@x.com", "b@y.com"}
    assert s.cors_origin_list == ["http://a.com", "http://b.com"]


def test_health_check(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_token_for_deleted_user_is_rejected(client):
    token = create_access_token(12345)  # valid signature, but no such user
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401
