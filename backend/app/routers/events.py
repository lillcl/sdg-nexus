"""Events router — anyone can create/view events; register via form."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.models.events import Event, EventRegistration

router = APIRouter(prefix="/events", tags=["events"])

class EventCreate(BaseModel):
    title: str
    description: str = ""
    event_type: str = "conference"
    sdg_goals: str = ""
    date_start: str
    date_end: str = ""
    location: str = ""
    is_virtual: bool = False
    organizer: str = ""
    registration_url: str = ""
    image_url: str = ""

class RegistrationCreate(BaseModel):
    full_name: str
    email: EmailStr
    organization: str = ""
    role: str = ""
    country: str = ""
    message: str = ""

@router.get("")
@router.get("/")
async def list_events(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Event).where(Event.is_published==True).order_by(Event.date_start.asc()))
    return r.scalars().all()

@router.get("/{event_id}")
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Event).where(Event.id == event_id))
    e = r.scalar_one_or_none()
    if not e: raise HTTPException(404, "Event not found")
    return e

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_event(req: EventCreate, db: AsyncSession = Depends(get_db)):
    e = Event(**req.model_dump(), created_at=datetime.utcnow().isoformat(), is_published=True)
    db.add(e); await db.commit(); await db.refresh(e)
    return e

@router.put("/{event_id}")
async def update_event(event_id: int, req: EventCreate, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Event).where(Event.id == event_id))
    e = r.scalar_one_or_none()
    if not e: raise HTTPException(404)
    for k, v in req.model_dump().items():
        setattr(e, k, v)
    await db.commit(); return e

@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Event).where(Event.id == event_id))
    e = r.scalar_one_or_none()
    if not e: raise HTTPException(404)
    await db.delete(e); await db.commit()

@router.post("/{event_id}/register", status_code=201)
async def register_for_event(event_id: int, req: RegistrationCreate, db: AsyncSession = Depends(get_db)):
    ev = await db.execute(select(Event).where(Event.id == event_id))
    if not ev.scalar_one_or_none(): raise HTTPException(404, "Event not found")
    reg = EventRegistration(
        **req.model_dump(), event_id=event_id,
        registered_at=datetime.utcnow().isoformat()
    )
    db.add(reg); await db.commit(); await db.refresh(reg)
    return {"id": reg.id, "message": "Registration successful"}

@router.get("/{event_id}/registrations")
async def list_registrations(event_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(EventRegistration).where(EventRegistration.event_id == event_id))
    return r.scalars().all()
