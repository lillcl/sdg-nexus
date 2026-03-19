"""
Supabase client configuration with debug logging and validation
"""
import os
import logging
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv()  # Also try CWD

logger = logging.getLogger(__name__)

def _get_env(key: str, fallback: str = "") -> str:
    val = os.environ.get(key, fallback)
    if not val:
        logger.warning(f"[Supabase] {key} is not set!")
    else:
        preview = val[:30] + "..." if len(val) > 30 else val
        logger.debug(f"[Supabase] {key} loaded: {preview}")
    return val

SUPABASE_URL = _get_env("SUPABASE_URL", "https://pmqvoluuqmurruedohic.supabase.co")
SUPABASE_KEY = _get_env("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = _get_env("SUPABASE_SERVICE_KEY")

# Ensure https:// prefix
if SUPABASE_URL and not SUPABASE_URL.startswith("https://"):
    SUPABASE_URL = "https://" + SUPABASE_URL
    logger.info(f"[Supabase] Added https:// prefix: {SUPABASE_URL}")

logger.info(f"[Supabase] URL: {SUPABASE_URL}")
logger.info(f"[Supabase] KEY set: {bool(SUPABASE_KEY)}")
logger.info(f"[Supabase] SERVICE_KEY set: {bool(SUPABASE_SERVICE_KEY)}")

_supabase_client = None
_supabase_admin = None

def get_supabase():
    """Get anon Supabase client (lazy init)"""
    global _supabase_client
    if _supabase_client is None:
        try:
            from supabase import create_client
            if not SUPABASE_URL or not SUPABASE_KEY:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("[Supabase] Anon client initialized successfully")
        except Exception as e:
            logger.error(f"[Supabase] Failed to init anon client: {e}")
            raise
    return _supabase_client

def get_supabase_admin():
    """Get service-role Supabase client (lazy init)"""
    global _supabase_admin
    if _supabase_admin is None:
        try:
            from supabase import create_client
            key = SUPABASE_SERVICE_KEY or SUPABASE_KEY
            if not SUPABASE_URL or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
            _supabase_admin = create_client(SUPABASE_URL, key)
            logger.info("[Supabase] Admin client initialized successfully")
        except Exception as e:
            logger.error(f"[Supabase] Failed to init admin client: {e}")
            raise
    return _supabase_admin
