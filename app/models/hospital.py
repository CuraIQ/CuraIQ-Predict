from datetime import datetime
import enum
import uuid
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WardType(str, enum.Enum):
    GENERAL = "general"
    ICU = "icu"
    EMERGENCY = "emergency"
    SURGICAL = "surgical"
    PEDIATRIC = "pediatric"
    MATERNITY = "maternity"
    ONCOLOGY = "oncology"


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    wards: Mapped[list["Ward"]] = relationship(back_populates="hospital", lazy="selectin")


class Ward(Base):
    __tablename__ = "wards"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    hospital_id: Mapped[UUID] = mapped_column(ForeignKey("hospitals.id"), nullable=False)
    ward_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ward_type: Mapped[WardType] = mapped_column(SAEnum(WardType), nullable=False, default=WardType.GENERAL)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    total_beds: Mapped[int] = mapped_column(Integer, nullable=False)
    occupied_beds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    hospital: Mapped["Hospital"] = relationship(back_populates="wards", lazy="joined")

    __table_args__ = (
        CheckConstraint("occupied_beds >= 0 AND occupied_beds <= total_beds", name="ck_ward_occupied_beds"),
        CheckConstraint("total_beds >= 0 AND total_beds <= capacity", name="ck_ward_total_beds"),
    )
