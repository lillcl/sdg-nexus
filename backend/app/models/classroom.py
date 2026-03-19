from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    teacher_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    sdg_focus: Mapped[str] = mapped_column(String(100))
    level: Mapped[str] = mapped_column(String(20), default="secondary")
    topics: Mapped[list["ProjectTopic"]] = relationship(back_populates="classroom", cascade="all, delete")

class ProjectTopic(Base):
    __tablename__ = "project_topics"

    id: Mapped[int] = mapped_column(primary_key=True)
    classroom_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    title: Mapped[str] = mapped_column(String(255))
    problem_statement: Mapped[str] = mapped_column(Text, default="")
    prototype_brief: Mapped[str] = mapped_column(Text, default="")
    difficulty: Mapped[int] = mapped_column(Integer, default=3)
    domain: Mapped[str] = mapped_column(String(50), default="tech")
    sdg_goal: Mapped[int] = mapped_column(Integer, default=1)
    rubric: Mapped[str] = mapped_column(Text, default="")
    assigned_to: Mapped[str] = mapped_column(Text, default="")  # JSON list of user IDs
    classroom: Mapped[Optional["Classroom"]] = relationship(back_populates="topics")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="topic", cascade="all, delete")

class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    topic_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    student_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    description: Mapped[str] = mapped_column(Text, default="")
    prototype_url: Mapped[str] = mapped_column(String(500), default="")
    reflection: Mapped[str] = mapped_column(Text, default="")
    topic: Mapped[Optional["ProjectTopic"]] = relationship(back_populates="submissions")
