"""Custom exception classes and exception handlers for PredictIQ."""

import logging
from typing import Any, Optional

from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("predictiq.exceptions")


class PredictIQException(Exception):
    """Base exception class for PredictIQ domain errors."""

    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_SERVER_ERROR",
    ) -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code
        self.error_code = error_code


class NotFoundException(PredictIQException):
    """Exception raised when a requested resource is not found (HTTP 404)."""

    def __init__(
        self,
        detail: str = "Resource not found",
        error_code: str = "NOT_FOUND",
    ) -> None:
        super().__init__(
            detail=detail,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code=error_code,
        )


class ValidationException(PredictIQException):
    """Exception raised for domain validation failures (HTTP 422)."""

    def __init__(
        self,
        detail: str = "Validation failed",
        error_code: str = "VALIDATION_ERROR",
    ) -> None:
        super().__init__(
            detail=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code=error_code,
        )


class ConflictException(PredictIQException):
    """Exception raised when a conflict occurs (HTTP 409)."""

    def __init__(
        self,
        detail: str = "Resource conflict occurred",
        error_code: str = "CONFLICT",
    ) -> None:
        super().__init__(
            detail=detail,
            status_code=status.HTTP_409_CONFLICT,
            error_code=error_code,
        )


async def predictiq_exception_handler(
    request: Request, exc: PredictIQException
) -> JSONResponse:
    """Handle custom PredictIQ exceptions and return structured JSON responses."""
    request_id: Optional[Any] = (
        getattr(request.state, "request_id", None)
        if hasattr(request, "state")
        else None
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
            },
            "request_id": request_id,
        },
    )


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Handle unhandled exceptions, log details, and return generic 500 error."""
    logger.exception("Unhandled error processing request: %s", exc)
    request_id: Optional[Any] = (
        getattr(request.state, "request_id", None)
        if hasattr(request, "state")
        else None
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred on the server.",
            },
            "request_id": request_id,
        },
    )
