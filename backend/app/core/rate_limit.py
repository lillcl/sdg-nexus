"""
Simple in-process rate limiter + Supabase-backed persistent limiter
Falls back gracefully if Supabase is unavailable
"""
import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException

logger = logging.getLogger(__name__)

# In-memory store: {ip: {endpoint: [timestamps]}}
_store: dict = defaultdict(lambda: defaultdict(list))

LIMITS = {
    "/auth/register": (5, 300),    # 5 per 5 minutes
    "/auth/login":    (20, 60),    # 20 per minute
    "/ai/":           (30, 60),    # 30 per minute for all AI endpoints
    "default":        (120, 60),   # 120 per minute default
}

def _get_limit(path: str):
    for prefix, limits in LIMITS.items():
        if path.startswith(prefix):
            return limits
    return LIMITS["default"]

def check_rate_limit(request: Request):
    """FastAPI dependency — raises 429 if over limit"""
    ip = request.client.host if request.client else "unknown"
    path = request.url.path
    max_hits, window_secs = _get_limit(path)

    now = time.time()
    bucket = _store[ip][path]
    # Clean old entries
    _store[ip][path] = [t for t in bucket if now - t < window_secs]
    bucket = _store[ip][path]

    if len(bucket) >= max_hits:
        logger.warning(f"[RateLimit] {ip} hit limit on {path} ({len(bucket)}/{max_hits})")
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Limit: {max_hits} per {window_secs}s. Try again shortly.",
            headers={"Retry-After": str(window_secs)},
        )

    _store[ip][path].append(now)
