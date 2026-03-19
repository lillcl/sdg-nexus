from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.models.committee import Committee, PositionPaper

router = APIRouter(prefix="/mun", tags=["mun"])

from typing import Optional

class CommitteeCreate(BaseModel):
    name: str
    sdg_focus: str
    topic: str = ""
    country_count: int = 10
    countries: str = "[]"        # JSON string of [{iso3,name,stance}]
    background_guide: str = ""
    output_length: str = "medium"
    formality: str = "academic"
    level: str = "university"
    director_id: Optional[int] = None   # None = anonymous

@router.post("/committees", status_code=201)
async def create_committee(req: CommitteeCreate, db: AsyncSession = Depends(get_db)):
    c = Committee(**req.model_dump())
    db.add(c); await db.commit(); await db.refresh(c)
    return c

@router.get("/committees")
async def list_committees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Committee).order_by(Committee.id.desc()))
    return result.scalars().all()

@router.get("/committees/{id}")
async def get_committee(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Committee).where(Committee.id == id))
    c = result.scalar_one_or_none()
    if not c: raise HTTPException(404, "Committee not found")
    return c

@router.patch("/committees/{id}")
async def update_committee(id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Committee).where(Committee.id == id))
    c = result.scalar_one_or_none()
    if not c: raise HTTPException(404)
    for k, v in data.items():
        if hasattr(c, k): setattr(c, k, v)
    await db.commit(); return c

@router.delete("/committees/{id}", status_code=204)
async def delete_committee(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Committee).where(Committee.id == id))
    c = result.scalar_one_or_none()
    if not c: raise HTTPException(404)
    await db.delete(c); await db.commit()

@router.post("/committees/{id}/papers", status_code=201)
async def save_paper(id: int, iso3: str, country_name: str, content: str, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(PositionPaper).where(PositionPaper.committee_id == id, PositionPaper.country_iso3 == iso3))
    paper = existing.scalar_one_or_none()
    if paper:
        paper.content = content
    else:
        paper = PositionPaper(committee_id=id, country_iso3=iso3, country_name=country_name, content=content)
        db.add(paper)
    await db.commit(); return paper

class PaperCreate(BaseModel):
    committee_id: int = 0
    country_iso3: str
    country_name: str
    content: str

@router.post("/position-papers", status_code=201)
async def create_position_paper(req: PaperCreate, db: AsyncSession = Depends(get_db)):
    """Standalone endpoint to save a position paper (committee_id=0 for unsaved committees)."""
    paper = PositionPaper(
        committee_id=req.committee_id or 0,
        country_iso3=req.country_iso3,
        country_name=req.country_name,
        content=req.content,
    )
    db.add(paper); await db.commit(); await db.refresh(paper)
    return paper

@router.get("/committees/{id}/papers")
async def list_papers(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PositionPaper).where(PositionPaper.committee_id == id))
    return result.scalars().all()
