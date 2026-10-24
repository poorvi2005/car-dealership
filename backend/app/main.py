"""
Application entry point.

Run locally with:   uvicorn app.main:app --reload
Interactive docs:   http://localhost:8000/docs
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth, vehicles


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()  # make sure the tables exist before the first request
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Car Dealership Inventory API",
        description="Register, log in, browse, search, buy and manage vehicles.",
        version="1.0.0",
        lifespan=lifespan,
    )
    # CORS: the React app runs on a different origin (port/domain), so the browser
    # needs the API to explicitly say "requests from that origin are allowed".
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router)
    app.include_router(vehicles.router)

    @app.get("/api/health", tags=["health"])
    def health():
        return {"status": "ok"}

    return app


app = create_app()
