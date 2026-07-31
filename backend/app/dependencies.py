"""FastAPI dependencies for request parameters."""

from fastapi import Query

from app.config import settings


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
