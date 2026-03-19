"""
MUN Coordinate Module — session management, speaker lists,
working papers, resolutions, voting records, and archives.
All endpoints are prefixed /coord and scoped by committee_id.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

from app.core.database import get_db
from app.models.user import User
from app.models.mun_coord import (
    Session, SpeakerEntry, WorkingPaper, Amendment,
    VoteRecord, Directive, PressRelease, Archive,
)

router = APIRouter(prefix="/coord", tags=["mun-coord"])


# ── Sessions ──────────────────────────────────────────────────────────
class SessionCreate(BaseModel):
    committee_id: int
    session_number: int
    date: str           # ISO date string
    start_time: str     # e.g. "09:00"
    end_time: str       # e.g. "12:00"
    chair_name: str = ""
    rapporteur_name: str = ""
    notes: str = ""

@router.post("/sessions", status_code=201)
async def create_session(req: SessionCreate, db: AsyncSession = Depends(get_db)):
    s = Session(**req.model_dump())
    db.add(s); await db.commit(); await db.refresh(s)
    return s

@router.get("/sessions/{committee_id}")
async def list_sessions(committee_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Session).where(Session.committee_id == committee_id).order_by(Session.session_number))
    return r.scalars().all()

@router.patch("/sessions/{session_id}")
async def update_session(session_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Session).where(Session.id == session_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404)
    for k, v in data.items():
        if hasattr(s, k): setattr(s, k, v)
    await db.commit(); return s


# ── Speaker List ──────────────────────────────────────────────────────
class SpeakerAdd(BaseModel):
    session_id: int
    country_iso3: str
    country_name: str
    speaker_name: str = ""
    speech_type: str = "primary"    # primary | reply | GSL
    duration_seconds: int = 60

@router.post("/speakers", status_code=201)
async def add_speaker(req: SpeakerAdd, db: AsyncSession = Depends(get_db)):
    # Get next position
    r = await db.execute(select(func.count()).where(SpeakerEntry.session_id == req.session_id))
    pos = r.scalar() + 1
    entry = SpeakerEntry(**req.model_dump(), position=pos, status="waiting")
    db.add(entry); await db.commit(); await db.refresh(entry)
    return entry

@router.get("/speakers/{session_id}")
async def list_speakers(session_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(SpeakerEntry).where(SpeakerEntry.session_id == session_id).order_by(SpeakerEntry.position))
    return r.scalars().all()

@router.patch("/speakers/{entry_id}/status")
async def update_speaker_status(entry_id: int, status: str, db: AsyncSession = Depends(get_db)):
    """status: waiting | speaking | done | yielded"""
    r = await db.execute(select(SpeakerEntry).where(SpeakerEntry.id == entry_id))
    e = r.scalar_one_or_none()
    if not e: raise HTTPException(404)
    e.status = status
    if status == "speaking": e.started_at = datetime.utcnow().isoformat()
    if status == "done": e.ended_at = datetime.utcnow().isoformat()
    await db.commit(); return e

@router.delete("/speakers/{entry_id}", status_code=204)
async def remove_speaker(entry_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(SpeakerEntry).where(SpeakerEntry.id == entry_id))
    e = r.scalar_one_or_none()
    if not e: raise HTTPException(404)
    await db.delete(e); await db.commit()


# ── Working Papers & Resolutions ──────────────────────────────────────
class WPCreate(BaseModel):
    committee_id: int
    session_id: int
    code: str           # e.g. WP/1/Rev.2
    title: str
    sponsors: List[str] = []   # list of ISO3
    signatories: List[str] = []
    content: str = ""
    paper_type: str = "working"   # working | draft | resolution

@router.post("/papers", status_code=201)
async def create_paper(req: WPCreate, db: AsyncSession = Depends(get_db)):
    wp = WorkingPaper(
        committee_id=req.committee_id,
        session_id=req.session_id,
        code=req.code, title=req.title,
        sponsors=json.dumps(req.sponsors),
        signatories=json.dumps(req.signatories),
        content=req.content,
        paper_type=req.paper_type,
        status="draft",
    )
    db.add(wp); await db.commit(); await db.refresh(wp)
    return wp

@router.get("/papers/{committee_id}")
async def list_papers(committee_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(WorkingPaper).where(WorkingPaper.committee_id == committee_id))
    return r.scalars().all()

@router.patch("/papers/{paper_id}")
async def update_paper(paper_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(WorkingPaper).where(WorkingPaper.id == paper_id))
    wp = r.scalar_one_or_none()
    if not wp: raise HTTPException(404)
    for k, v in data.items():
        if hasattr(wp, k): setattr(wp, k, v)
    await db.commit(); return wp

@router.patch("/papers/{paper_id}/promote")
async def promote_paper(paper_id: int, db: AsyncSession = Depends(get_db)):
    """working → draft resolution → passed resolution"""
    r = await db.execute(select(WorkingPaper).where(WorkingPaper.id == paper_id))
    wp = r.scalar_one_or_none()
    if not wp: raise HTTPException(404)
    transitions = {"working": "draft", "draft": "passed"}
    wp.status = transitions.get(wp.status, wp.status)
    if wp.status == "passed": wp.paper_type = "resolution"
    await db.commit(); return wp


# ── Amendments ────────────────────────────────────────────────────────
class AmendCreate(BaseModel):
    paper_id: int
    proposed_by: str   # ISO3
    clause_ref: str    # e.g. "OP3"
    amendment_type: str  # friendly | unfriendly | add | delete
    text: str

@router.post("/amendments", status_code=201)
async def create_amendment(req: AmendCreate, db: AsyncSession = Depends(get_db)):
    a = Amendment(**req.model_dump(), status="pending")
    db.add(a); await db.commit(); await db.refresh(a)
    return a

@router.patch("/amendments/{amend_id}/status")
async def update_amendment(amend_id: int, status: str, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Amendment).where(Amendment.id == amend_id))
    a = r.scalar_one_or_none()
    if not a: raise HTTPException(404)
    a.status = status  # pending | accepted | rejected
    await db.commit(); return a


# ── Voting ────────────────────────────────────────────────────────────
class VoteCreate(BaseModel):
    paper_id: int
    session_id: int
    vote_type: str        # procedural | substantive
    votes_for: int = 0
    votes_against: int = 0
    abstentions: int = 0
    individual_votes: dict = {}   # {iso3: "for"|"against"|"abstain"|"absent"}
    result: str = ""              # passed | failed | no_action

@router.post("/votes", status_code=201)
async def record_vote(req: VoteCreate, db: AsyncSession = Depends(get_db)):
    total = req.votes_for + req.votes_against + req.abstentions
    result = req.result
    if not result:
        if req.vote_type == "procedural":
            result = "passed" if req.votes_for > total / 2 else "failed"
        else:
            result = "passed" if req.votes_for > (req.votes_for + req.votes_against) * 2/3 else "failed"
    vr = VoteRecord(
        paper_id=req.paper_id, session_id=req.session_id,
        vote_type=req.vote_type, votes_for=req.votes_for,
        votes_against=req.votes_against, abstentions=req.abstentions,
        individual_votes=json.dumps(req.individual_votes),
        result=result, voted_at=datetime.utcnow().isoformat(),
    )
    db.add(vr); await db.commit(); await db.refresh(vr)
    return vr

@router.get("/votes/{paper_id}")
async def get_votes(paper_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(VoteRecord).where(VoteRecord.paper_id == paper_id))
    return r.scalars().all()


# ── Directives (Crisis) ───────────────────────────────────────────────
class DirectiveCreate(BaseModel):
    committee_id: int
    session_id: int
    from_country: str
    directive_type: str    # intelligence | action | press | back_room
    content: str
    priority: str = "normal"   # urgent | normal | low

@router.post("/directives", status_code=201)
async def create_directive(req: DirectiveCreate, db: AsyncSession = Depends(get_db)):
    d = Directive(**req.model_dump(), status="submitted", submitted_at=datetime.utcnow().isoformat())
    db.add(d); await db.commit(); await db.refresh(d)
    return d

@router.get("/directives/{committee_id}")
async def list_directives(committee_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Directive).where(Directive.committee_id == committee_id).order_by(Directive.submitted_at.desc()))
    return r.scalars().all()

@router.patch("/directives/{dir_id}/status")
async def update_directive_status(dir_id: int, status: str, response: str = "", db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Directive).where(Directive.id == dir_id))
    d = r.scalar_one_or_none()
    if not d: raise HTTPException(404)
    d.status = status   # submitted | approved | rejected | executed
    if response: d.chair_response = response
    await db.commit(); return d


# ── Press Releases ────────────────────────────────────────────────────
class PressCreate(BaseModel):
    committee_id: int
    session_id: int
    country_iso3: str
    headline: str
    body: str
    is_public: bool = True

@router.post("/press", status_code=201)
async def create_press(req: PressCreate, db: AsyncSession = Depends(get_db)):
    p = PressRelease(**req.model_dump(), published_at=datetime.utcnow().isoformat())
    db.add(p); await db.commit(); await db.refresh(p)
    return p

@router.get("/press/{committee_id}")
async def list_press(committee_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(PressRelease).where(PressRelease.committee_id == committee_id, PressRelease.is_public == True).order_by(PressRelease.published_at.desc()))
    return r.scalars().all()


# ── Archive ────────────────────────────────────────────────────────────
@router.post("/archive/{committee_id}", status_code=201)
async def archive_committee(committee_id: int, db: AsyncSession = Depends(get_db)):
    """Snapshot the full committee state into an archive record."""
    sessions_r = await db.execute(select(Session).where(Session.committee_id == committee_id))
    papers_r = await db.execute(select(WorkingPaper).where(WorkingPaper.committee_id == committee_id))
    votes_data = []
    for paper in papers_r.scalars().all():
        vr = await db.execute(select(VoteRecord).where(VoteRecord.paper_id == paper.id))
        votes_data.append({"paper": paper.code, "votes": [v.__dict__ for v in vr.scalars().all()]})

    archive = Archive(
        committee_id=committee_id,
        archived_at=datetime.utcnow().isoformat(),
        session_count=len(sessions_r.scalars().all()),
        snapshot=json.dumps({"votes": votes_data}),
    )
    db.add(archive); await db.commit(); await db.refresh(archive)
    return archive

@router.get("/archive/{committee_id}")
async def get_archive(committee_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Archive).where(Archive.committee_id == committee_id).order_by(Archive.archived_at.desc()))
    return r.scalars().all()


# ── Committee endpoint — list available committees ─────────────────────
@router.get("/catalogue")
async def get_committee_catalogue():
    """Returns the full list of MUN committees for the setup picker."""
    from app.data.committees import COMMITTEES
    return COMMITTEES


# ── Auto-provision: ensure session 1 exists for a committee ──────────
@router.post("/ensure-session/{committee_id}", status_code=200)
async def ensure_session(committee_id: int, db: AsyncSession = Depends(get_db)):
    """Idempotent: creates session 1 for committee if not exists."""
    from datetime import date
    r = await db.execute(select(Session).where(
        Session.committee_id == committee_id, Session.session_number == 1
    ))
    s = r.scalar_one_or_none()
    if not s:
        s = Session(
            committee_id=committee_id, session_number=1,
            date=date.today().isoformat(), start_time="09:00", end_time="18:00",
            chair_name="", rapporteur_name="", notes="Auto-created",
        )
        db.add(s); await db.commit(); await db.refresh(s)
    return {"session_id": s.id, "committee_id": committee_id}
