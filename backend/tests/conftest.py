"""
Shared test fixtures.

Each test gets a brand-new, empty SQLite database held in memory, so tests never
touch the real database and never affect each other. (The *app* itself uses a real
file/Postgres database; only the tests use an in-memory one, for speed and isolation.)
"""
import os

# Must be set BEFORE the app is imported so settings pick them up.
os.environ["ADMIN_EMAILS"] = "admin@dealership.com"
os.environ["JWT_SECRET"] = "test-secret-key-that-is-long-enough-123"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import get_settings
from app.database import Base, get_db
from app.main import create_app

get_settings.cache_clear()

ADMIN_EMAIL = "admin@dealership.com"
USER_EMAIL = "buyer@example.com"
PASSWORD = "supersecret123"


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # one shared connection so the in-memory DB survives
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture()
def client(db_session):
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app)


def register(client, email, password=PASSWORD, full_name="Test Person"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )


@pytest.fixture()
def user_headers(client):
    token = register(client, USER_EMAIL).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers(client):
    token = register(client, ADMIN_EMAIL, full_name="Lot Manager").json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


SAMPLE_VEHICLE = {
    "make": "Toyota",
    "model": "Corolla",
    "category": "Sedan",
    "price": 1850000,
    "quantity": 3,
    "year": 2024,
    "color": "Pearl White",
}


@pytest.fixture()
def vehicle(client, admin_headers):
    return client.post("/api/vehicles", json=SAMPLE_VEHICLE, headers=admin_headers).json()
