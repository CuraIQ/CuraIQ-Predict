from datetime import datetime
import enum
import uuid
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    hospital_id: Mapped[UUID] = mapped_column(ForeignKey("hospitals.id"), nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    batch_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    current_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    minimum_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    burn_rate_per_hour: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    last_restocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint("current_stock >= 0", name="ck_inventory_current_stock"),
        CheckConstraint("minimum_threshold >= 0", name="ck_inventory_minimum_threshold"),
        CheckConstraint("burn_rate_per_hour >= 0.0", name="ck_inventory_burn_rate_per_hour"),
    )
