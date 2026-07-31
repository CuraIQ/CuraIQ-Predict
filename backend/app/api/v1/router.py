"""Aggregated v1 API router."""

from fastapi import APIRouter

from app.api.v1.endpoints import overview, predictions, wards, telemetry, live_control

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(overview.router)
api_v1_router.include_router(predictions.router)
api_v1_router.include_router(wards.router)
api_v1_router.include_router(telemetry.router)
api_v1_router.include_router(live_control.router)
