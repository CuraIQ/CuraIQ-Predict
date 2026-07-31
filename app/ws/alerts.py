"""Real-time predictive alert WebSocket broadcaster."""

import asyncio
import logging
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.prediction import Prediction, PredictionStatus
from app.api.v1.endpoints.predictions import _risk_level

logger = logging.getLogger("predictiq.ws.alerts")


class AlertConnectionManager:
    """Tracks active WebSocket clients and broadcasts alert payloads."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WS client connected (%d total)", len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("WS client disconnected (%d remaining)", len(self.active_connections))

    async def broadcast(self, payload: dict) -> None:
        stale: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


alert_manager = AlertConnectionManager()


def _prediction_to_ws_payload(prediction: Prediction) -> dict:
    return {
        "id": str(prediction.id),
        "prediction_type": prediction.prediction_type.value,
        "risk_score": prediction.risk_score,
        "risk_level": _risk_level(prediction.risk_score),
        "forecasted_event": prediction.forecasted_event,
        "target_timestamp": prediction.target_timestamp.isoformat(),
        "recommended_action": prediction.recommended_action,
        "ward_id": str(prediction.ward_id) if prediction.ward_id else None,
    }


async def _fetch_high_risk_predictions() -> list[Prediction]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Prediction)
            .where(
                Prediction.status == PredictionStatus.ACTIVE,
                Prediction.risk_score >= 0.7,
            )
            .order_by(Prediction.risk_score.desc())
            .limit(5)
        )
        return list(result.scalars().all())


async def alert_broadcaster_loop(stop_event: asyncio.Event, interval_seconds: float = 20.0) -> None:
    """Periodically push high-risk active predictions to all connected clients."""
    while not stop_event.is_set():
        try:
            if alert_manager.active_connections:
                predictions = await _fetch_high_risk_predictions()
                for prediction in predictions:
                    await alert_manager.broadcast(_prediction_to_ws_payload(prediction))
        except Exception:
            logger.exception("Alert broadcaster loop error")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
        except asyncio.TimeoutError:
            continue


async def websocket_alerts_endpoint(websocket: WebSocket) -> None:
    """WebSocket handler for /ws/alerts."""
    await alert_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; clients may send ping/text
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)
