"""Org news router — CRUD for organisation news articles"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.routers.auth_supabase import get_current_user
from app.core.supabase import get_supabase_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/org-news", tags=["org_news"])

class NewsArticle(BaseModel):
    title: str
    slug: str
    summary: str = ""
    body: str = ""
    image_url: str = ""
    category: str = "news"
    author: str = ""
    featured: bool = False
    published_at: Optional[str] = None

@router.get("")
async def list_news():
    try:
        supabase = get_supabase_admin()
        r = supabase.table("org_news").select("*").order("published_at", desc=True).execute()
        return r.data or []
    except Exception as e:
        logger.error(f"org_news list error: {e}")
        return []

@router.post("", status_code=201)
async def create_news(article: NewsArticle, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["superadmin", "admin"]:
        raise HTTPException(403, "Admin only")
    try:
        supabase = get_supabase_admin()
        data = article.model_dump()
        if not data.get("published_at"):
            from datetime import datetime
            data["published_at"] = datetime.utcnow().isoformat()
        r = supabase.table("org_news").insert(data).execute()
        return r.data[0] if r.data else {}
    except Exception as e:
        raise HTTPException(400, str(e))

@router.put("/{article_id}")
async def update_news(article_id: str, article: NewsArticle, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["superadmin", "admin"]:
        raise HTTPException(403, "Admin only")
    try:
        supabase = get_supabase_admin()
        data = article.model_dump()
        r = supabase.table("org_news").update(data).eq("id", article_id).execute()
        return r.data[0] if r.data else {}
    except Exception as e:
        raise HTTPException(400, str(e))

@router.delete("/{article_id}")
async def delete_news(article_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["superadmin", "admin"]:
        raise HTTPException(403, "Admin only")
    try:
        supabase = get_supabase_admin()
        supabase.table("org_news").delete().eq("id", article_id).execute()
        return {"deleted": article_id}
    except Exception as e:
        raise HTTPException(400, str(e))
