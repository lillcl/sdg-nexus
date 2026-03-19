import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Make SQLite optional — skip entirely if DATABASE_URL not set or empty
_db_url = (settings.database_url or "").strip()
if _db_url and not _db_url.startswith("sqlite"):
    engine = create_async_engine(_db_url, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    logger.info(f"[DB] Using database: {_db_url[:30]}...")
elif _db_url.startswith("sqlite"):
    engine = create_async_engine(_db_url, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    logger.info("[DB] Using SQLite (local dev)")
else:
    engine = None
    AsyncSessionLocal = None
    logger.info("[DB] No DATABASE_URL — SQLite disabled, using Supabase only")

async def get_db():
    if AsyncSessionLocal is None:
        return
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    if engine is None:
        logger.info("[DB] init_db skipped — no engine configured")
        return
    import app.models.user
    import app.models.committee
    import app.models.classroom
    import app.models.mun_coord
    import app.models.events
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("[DB] Tables created/verified")
    except Exception as e:
        logger.warning(f"[DB] init_db warning (non-fatal): {e}")
