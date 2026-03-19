#!/usr/bin/env python3
"""
Database initialization script for SDG Nexus
Run this to set up all database tables
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import Base as UserBase
from app.models.classroom import Base as ClassroomBase
from app.models.committee import Base as CommitteeBase
from app.models.events import Base as EventsBase
from app.models.mun_coord import Base as MUNCoordBase

async def init_db():
    """Initialize all database tables"""
    print("Initializing database...")
    
    # Create async engine
    engine = create_async_engine(
        settings.database_url,
        echo=True
    )
    
    # Create all tables
    async with engine.begin() as conn:
        # Drop all tables (for fresh start)
        print("Dropping existing tables...")
        await conn.run_sync(UserBase.metadata.drop_all)
        await conn.run_sync(ClassroomBase.metadata.drop_all)
        await conn.run_sync(CommitteeBase.metadata.drop_all)
        await conn.run_sync(EventsBase.metadata.drop_all)
        await conn.run_sync(MUNCoordBase.metadata.drop_all)
        
        # Create all tables
        print("Creating tables...")
        await conn.run_sync(UserBase.metadata.create_all)
        await conn.run_sync(ClassroomBase.metadata.create_all)
        await conn.run_sync(CommitteeBase.metadata.create_all)
        await conn.run_sync(EventsBase.metadata.create_all)
        await conn.run_sync(MUNCoordBase.metadata.create_all)
    
    print("✅ Database initialized successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
