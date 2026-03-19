"""
Admin settings router — AI provider config, managed by superadmin only
"""
import logging, json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.supabase import get_supabase, get_supabase_admin
from app.routers.auth_supabase import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

class AIConfig(BaseModel):
    provider: str          # ollama | openai | anthropic | deepseek | gemini | groq
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model: Optional[str] = None

PROVIDER_DEFAULTS = {
    "ollama":    {"base_url": "http://localhost:11434", "model": "llama3"},
    "openai":    {"base_url": "https://api.openai.com/v1", "model": "gpt-4o-mini"},
    "anthropic": {"base_url": "https://api.anthropic.com", "model": "claude-3-haiku-20240307"},
    "deepseek":  {"base_url": "https://api.deepseek.com/v1", "model": "deepseek-chat"},
    "gemini":    {"base_url": "https://generativelanguage.googleapis.com/v1beta", "model": "gemini-1.5-flash"},
    "groq":      {"base_url": "https://api.groq.com/openai/v1", "model": "llama-3.1-70b-versatile"},
}

@router.get("/ai-config")
async def get_ai_config(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin only")
    sb = get_supabase()
    try:
        r = sb.table("app_settings").select("value").eq("key", "ai_config").execute()
        if r.data:
            cfg = json.loads(r.data[0]["value"])
            # Mask API key
            if cfg.get("api_key"):
                cfg["api_key"] = cfg["api_key"][:8] + "..." + cfg["api_key"][-4:] if len(cfg.get("api_key","")) > 12 else "***"
            return cfg
        return {"provider": "ollama"}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.put("/ai-config")
async def update_ai_config(req: AIConfig, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin only")
    sb = get_supabase_admin()
    try:
        # Get existing to preserve masked key if not updated
        existing = {}
        r = sb.table("app_settings").select("value").eq("key", "ai_config").execute()
        if r.data:
            existing = json.loads(r.data[0]["value"])
        
        cfg = {
            "provider": req.provider,
            "model": req.model or PROVIDER_DEFAULTS.get(req.provider, {}).get("model", ""),
            "base_url": req.base_url or PROVIDER_DEFAULTS.get(req.provider, {}).get("base_url", ""),
            "api_key": req.api_key if req.api_key and not req.api_key.endswith("...") else existing.get("api_key", ""),
        }
        sb.table("app_settings").upsert({"key": "ai_config", "value": json.dumps(cfg)}).execute()
        
        # Apply to running settings
        from app.core.config import settings
        settings.ai_provider = req.provider
        if cfg["api_key"]: settings.openai_api_key = cfg["api_key"]
        if cfg["model"]: settings.openai_model = cfg["model"]
        if cfg["base_url"]: settings.openai_base_url = cfg["base_url"]
        
        # Reinitialize AI provider
        import app.ai.provider as aip
        aip.ai = aip.get_ai_provider()
        
        return {"message": f"AI provider updated to {req.provider}", "model": cfg["model"]}
    except Exception as e:
        raise HTTPException(400, str(e))

@router.get("/ai-providers")
async def list_providers():
    """Public — list available providers and their default models"""
    return {"providers": PROVIDER_DEFAULTS}
