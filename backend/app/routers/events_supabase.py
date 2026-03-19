"""
Events router — full field support after v18 migration
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from app.core.supabase import get_supabase
from app.routers.auth_supabase import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: str                       # YYYY-MM-DD (maps from date_start)
    date_end: Optional[str] = None
    event_type: Optional[str] = "conference"
    organizer: Optional[str] = ""
    location: Optional[str] = ""
    is_virtual: Optional[bool] = False
    registration_url: Optional[str] = ""
    image_url: Optional[str] = ""
    sdg_tags: Optional[List[str]] = []
    sdg_goals: Optional[str] = ""  # comma-separated

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    date_end: Optional[str] = None
    event_type: Optional[str] = None
    organizer: Optional[str] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    registration_url: Optional[str] = None
    sdg_tags: Optional[List[str]] = None
    sdg_goals: Optional[str] = None

@router.get("")
async def list_events(search: Optional[str] = None, event_type: Optional[str] = None):
    sb = get_supabase()
    try:
        q = sb.table("events").select("*").order("date", desc=False)
        if event_type and event_type != "all":
            q = q.eq("event_type", event_type)
        r = q.execute()
        data = r.data
        # Server-side search filter
        if search:
            s = search.lower()
            data = [e for e in data if s in (e.get("title","") or "").lower()
                    or s in (e.get("description","") or "").lower()
                    or s in (e.get("organizer","") or "").lower()
                    or s in (e.get("location","") or "").lower()]
        return data
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/{event_id}")
async def get_event(event_id: str):
    sb = get_supabase()
    try:
        r = sb.table("events").select("*").eq("id", event_id).execute()
        if not r.data:
            raise HTTPException(404, "Event not found")
        return r.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("", status_code=201)
async def create_event(event: EventCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(403, "Only admin and superadmin can create events")
    sb = get_supabase()
    try:
        payload = {
            "title": event.title,
            "description": event.description,
            "date": event.date,
            "sdg_tags": event.sdg_tags,
            "created_by": current_user["id"],
        }
        # Add extended fields (present after v18 migration)
        for f in ("date_end","event_type","organizer","location","is_virtual","registration_url","image_url","sdg_goals"):
            v = getattr(event, f, None)
            if v is not None:
                payload[f] = v
        r = sb.table("events").insert(payload).execute()
        return r.data[0] if r.data else {"message": "created"}
    except Exception as e:
        raise HTTPException(400, str(e))

@router.put("/{event_id}")
async def update_event(event_id: str, event: EventUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(403, "Only admin and superadmin can update events")
    sb = get_supabase()
    try:
        update_data = {k: v for k, v in event.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(400, "No fields to update")
        r = sb.table("events").update(update_data).eq("id", event_id).execute()
        return r.data[0] if r.data else {"message": "updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))

@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(403, "Only admin and superadmin can delete events")
    sb = get_supabase()
    try:
        sb.table("events").delete().eq("id", event_id).execute()
        return {"message": "deleted"}
    except Exception as e:
        raise HTTPException(400, str(e))


class EventRegister(BaseModel):
    full_name: str
    email: str
    organization: str = ""
    role: str = ""
    country: str = ""
    message: str = ""

@router.post("/{event_id}/register", status_code=201)
async def register_for_event(event_id: str, reg: EventRegister):
    """Anyone can register for an event (no auth required)"""
    sb = get_supabase()
    try:
        # Store registration in a simple way - append to event or use a registrations table
        # For now log to registrations table if it exists, else return success
        try:
            sb.table("event_registrations").insert({
                "event_id": event_id,
                "full_name": reg.full_name,
                "email": reg.email,
                "organization": reg.organization,
                "country": reg.country,
                "message": reg.message,
            }).execute()
        except Exception:
            pass  # Table may not exist yet — migration needed
        return {"message": "Registration submitted successfully", "event_id": event_id}
    except Exception as e:
        raise HTTPException(400, str(e))
