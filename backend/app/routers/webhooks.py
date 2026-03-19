"""
n8n / external webhook integration.
POST /webhooks/n8n — receives payloads from n8n workflows
Use in n8n: HTTP Request node → POST http://localhost:8000/webhooks/n8n
            Header: X-Webhook-Secret: <your secret>
"""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import json

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

WEBHOOK_SECRET = "sdg-nexus-webhook-secret"  # Change this / move to .env

@router.post("/n8n")
async def n8n_webhook(request: Request, x_webhook_secret: Optional[str] = Header(None)):
    # Optional secret validation
    if x_webhook_secret and x_webhook_secret != WEBHOOK_SECRET:
        raise HTTPException(403, "Invalid webhook secret")
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    
    event_type = payload.get("event_type", "unknown")
    data = payload.get("data", {})
    
    # Handle different n8n workflow events
    handlers = {
        "new_registration": _handle_registration,
        "vote_passed":      _handle_vote_passed,
        "paper_submitted":  _handle_paper_submitted,
        "custom":           _handle_custom,
    }
    handler = handlers.get(event_type, _handle_custom)
    result = await handler(data)
    return {"received": True, "event_type": event_type, "result": result}

async def _handle_registration(data: dict):
    return {"action": "registration_noted", "name": data.get("full_name")}

async def _handle_vote_passed(data: dict):
    return {"action": "vote_recorded", "resolution": data.get("resolution_code")}

async def _handle_paper_submitted(data: dict):
    return {"action": "paper_noted", "code": data.get("paper_code")}

async def _handle_custom(data: dict):
    return {"action": "custom_processed", "keys": list(data.keys())}

@router.get("/n8n/test")
async def test_webhook():
    """Test endpoint to verify the webhook is reachable from n8n."""
    return {"status": "ok", "message": "SDG Nexus webhook endpoint is live"}
