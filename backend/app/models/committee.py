from sqlalchemy import String, Text, Integer, JSON, ForeignKey
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Committee(Base):
    __tablename__ = "committees"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    sdg_focus: Mapped[str] = mapped_column(String(100))  # e.g. "SDG3,SDG6"
    topic: Mapped[str] = mapped_column(Text, default="")
    country_count: Mapped[int] = mapped_column(Integer, default=10)
    countries: Mapped[str] = mapped_column(Text, default="")  # JSON list of ISO3
    background_guide: Mapped[str] = mapped_column(Text, default="")
    output_length: Mapped[str] = mapped_column(String(20), default="medium")
    formality: Mapped[str] = mapped_column(String(20), default="academic")
    level: Mapped[str] = mapped_column(String(20), default="university")
    director_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)

class PositionPaper(Base):
    __tablename__ = "position_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    committee_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    country_iso3: Mapped[str] = mapped_column(String(3))
    country_name: Mapped[str] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text, default="")
    # No relationship if committee_id is nullable — use explicit join in queries if needed
