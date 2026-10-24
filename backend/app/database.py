"""
Database wiring.

- `engine`       : the connection pool to the actual database (SQLite file or PostgreSQL).
- `SessionLocal` : a factory that hands out a fresh Session (a "unit of work") per request.
- `Base`         : every ORM model inherits from this so SQLAlchemy knows about its table.
- `get_db`       : FastAPI dependency that opens a session for a request and always closes it.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def build_engine(url: str):
    # SQLite blocks access from other threads by default; FastAPI uses a thread pool,
    # so we relax that check. Postgres does not need (or accept) this argument.
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)


engine = build_engine(get_settings().sqlalchemy_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables that don't exist yet. (Alembic migrations would replace this in a bigger app.)"""
    from app import models  # noqa: F401  -- importing registers the models on Base

    Base.metadata.create_all(bind=engine)
