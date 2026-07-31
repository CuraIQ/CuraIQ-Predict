"""PredictIQ – FastAPI application factory."""

import asyncio
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings

from app.exceptions import (
    PredictIQException,
    predictiq_exception_handler,
    unhandled_exception_handler,
)
from app.api.v1.router import api_v1_router
from app.schemas.common import HealthResponse
from app.ws.alerts import alert_broadcaster_loop, websocket_alerts_endpoint


from app.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize background tasks and cleanly shut them down."""
    
    # Initialize DB
    seed_database()

    stop_event = asyncio.Event()
    broadcaster_task = asyncio.create_task(alert_broadcaster_loop(stop_event))

    yield

    stop_event.set()
    broadcaster_task.cancel()
    try:
        await broadcaster_task
    except asyncio.CancelledError:
        pass



def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── Middleware ───────────────────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        """Inject a unique request ID for tracing."""
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    # ── Exception handlers ──────────────────────────────────────────
    application.add_exception_handler(PredictIQException, predictiq_exception_handler)
    application.add_exception_handler(Exception, unhandled_exception_handler)

    # ── Routers ─────────────────────────────────────────────────────
    application.include_router(api_v1_router)

    @application.websocket("/ws/alerts")
    async def ws_alerts(websocket: WebSocket):
        await websocket_alerts_endpoint(websocket)

    # ── Health endpoint ─────────────────────────────────────────────
    @application.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
    async def health_check():
        return HealthResponse(version=settings.APP_VERSION, environment=settings.APP_ENV)

    return application


app = create_app()
