import logging
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.routers import ai, map, mun, classroom, mun_coord, webhooks, games
from app.routers import auth_supabase as auth
from app.routers import events_supabase as events
from app.routers import moodle
from app.routers import settings as settings_router
from app.routers import admin_settings
from app.routers import uploads
from app.routers import org_news as org_news_router
from app.core.rate_limit import check_rate_limit

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
import time as _time
_startup_time = _time.time()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SDG Nexus API v20...")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="SDG Nexus API",
    version="12.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
        allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://localhost:4173",
        # Deployed URLs
        "https://lillcl-sdg-nexus.vercel.app",
        "https://frontend-lillcls-projects.vercel.app",
        "https://frontend-edkpqez55-lillcls-projects.vercel.app",
        "https://*.vercel.app",
        "https://*.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(map.router)
app.include_router(ai.router)
app.include_router(mun.router)
app.include_router(classroom.router)
app.include_router(mun_coord.router)
app.include_router(events.router)
app.include_router(webhooks.router)
app.include_router(games.router)
app.include_router(moodle.router)
app.include_router(settings_router.router)
app.include_router(admin_settings.router)
app.include_router(uploads.router)
app.include_router(org_news_router.router)

# Serve uploaded files at /static/uploads/<filename>
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=STATIC_DIR), name="static_uploads")

@app.get("/")
async def root():
    return {"status": "SDG Nexus API v12 - Supabase Enabled", "docs": "/docs"}

@app.get("/health")
async def health():
    uptime = _time.time() - _startup_time
    return {"status": "healthy", "version": "20.0.0", "uptime_seconds": round(uptime, 1), "database": "supabase"}
