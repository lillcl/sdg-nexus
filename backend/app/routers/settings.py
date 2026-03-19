"""
App settings router — persistent branding stored in Supabase app_settings table
"""
import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.supabase import get_supabase, get_supabase_admin
from app.routers.auth_supabase import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["settings"])

class BrandingUpdate(BaseModel):
    appName: str
    tagline: str
    subtagline: str
    footerNote: str
    stats: dict
    ctaExplore: str
    ctaLearn: str

@router.get("/branding")
async def get_branding():
    """Public — read branding config"""
    sb = get_supabase()
    try:
        r = sb.table("app_settings").select("value").eq("key", "branding").execute()
        if r.data:
            return json.loads(r.data[0]["value"])
        return {}
    except Exception as e:
        logger.warning(f"[settings] Could not fetch branding: {e}")
        return {}

@router.put("/branding")
async def update_branding(req: BrandingUpdate, current_user: dict = Depends(get_current_user)):
    """Superadmin only — update branding config"""
    if current_user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin only")
    sb = get_supabase_admin()
    try:
        payload = json.dumps(req.model_dump())
        sb.table("app_settings").upsert({"key": "branding", "value": payload}).execute()
        return {"message": "Branding updated"}
    except Exception as e:
        raise HTTPException(400, str(e))
