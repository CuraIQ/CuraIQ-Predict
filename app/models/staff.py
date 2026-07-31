from datetime import datetime
import enum
import uuid
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StaffRole(str, enum.Enum):
    DOCTOR = "doctor"
    NURSE = "nurse"
    TECHNICIAN = "technician"
    ADMIN = "admin"
    SPECIALIST = "specialist"


class ShiftStatus(str, enum.Enum):
    ON_DUTY = "on_duty"
    OFF_DUTY = "off_duty"
    ON_BREAK = "on_break"
    ON_LEAVE = "on_leave"


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    hospital_id: Mapped[UUID] = mapped_column(ForeignKey("hospitals.id"), nullable=False)
    ward_id: Mapped[UUID | None] = mapped_column(ForeignKey("wards.id"), nullable=True)
    staff_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[StaffRole] = mapped_column(SAEnum(StaffRole), nullable=False)
    shift_status: Mapped[ShiftStatus] = mapped_column(
        SAEnum(ShiftStatus), nullable=False, default=ShiftStatus.ON_DUTY
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
