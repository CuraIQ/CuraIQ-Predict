"""FastAPI dependencies for database sessions and request parameters."""

from typing import AsyncGenerator

from fastapi import Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session and ensures closure in finally block."""
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()


class PaginationParams:
    """Dependency class for standard pagination query parameters."""

    def __init__(
        self,
        page: int = Query(1, ge=1),
        page_size: int = Query(
            default=settings.PAGE_SIZE_DEFAULT,
            ge=1,
            le=settings.PAGE_SIZE_MAX,
        ),
    ) -> None:
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size
