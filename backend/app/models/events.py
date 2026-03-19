from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    event_type = Column(String(50), default="conference")  # conference|workshop|mun|webinar|summit
    sdg_goals = Column(String(100), default="")            # comma-sep goal numbers
    date_start = Column(String(20), nullable=False)
    date_end = Column(String(20), default="")
    location = Column(String(255), default="")
    is_virtual = Column(Boolean, default=False)
    organizer = Column(String(255), default="")
    registration_url = Column(String(500), default="")
    image_url = Column(String(500), default="")
    is_published = Column(Boolean, default=True)
    created_by = Column(Integer, nullable=True)            # user_id, null = anyone
    created_at = Column(String(30), default="")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False)
    organization = Column(String(255), default="")
    role = Column(String(100), default="")
    country = Column(String(100), default="")
    message = Column(Text, default="")
    registered_at = Column(String(30), default="")
