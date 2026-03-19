"""
MUN Coordinate DB models — sessions, speaker lists,
working papers, amendments, votes, directives, press, archives.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from app.core.database import Base


class Session(Base):
    __tablename__ = "coord_sessions"
    id = Column(Integer, primary_key=True, index=True)
    committee_id = Column(Integer, nullable=False, index=True)
    session_number = Column(Integer, nullable=False)
    date = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    chair_name = Column(String, default="")
    rapporteur_name = Column(String, default="")
    notes = Column(Text, default="")

class SpeakerEntry(Base):
    __tablename__ = "coord_speakers"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False, index=True)
    country_iso3 = Column(String(3))
    country_name = Column(String)
    speaker_name = Column(String, default="")
    speech_type = Column(String, default="primary")
    duration_seconds = Column(Integer, default=60)
    position = Column(Integer, default=0)
    status = Column(String, default="waiting")   # waiting|speaking|done|yielded
    started_at = Column(String, nullable=True)
    ended_at = Column(String, nullable=True)

class WorkingPaper(Base):
    __tablename__ = "coord_papers"
    id = Column(Integer, primary_key=True, index=True)
    committee_id = Column(Integer, nullable=False, index=True)
    session_id = Column(Integer, nullable=False)
    code = Column(String)
    title = Column(String)
    sponsors = Column(Text, default="[]")       # JSON list of ISO3
    signatories = Column(Text, default="[]")
    content = Column(Text, default="")
    paper_type = Column(String, default="working")  # working|draft|resolution
    status = Column(String, default="draft")        # draft|passed|failed|tabled

class Amendment(Base):
    __tablename__ = "coord_amendments"
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, nullable=False)
    proposed_by = Column(String(3))
    clause_ref = Column(String)
    amendment_type = Column(String)   # friendly|unfriendly|add|delete
    text = Column(Text)
    status = Column(String, default="pending")   # pending|accepted|rejected

class VoteRecord(Base):
    __tablename__ = "coord_votes"
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, nullable=False)
    session_id = Column(Integer, nullable=False)
    vote_type = Column(String)           # procedural|substantive
    votes_for = Column(Integer, default=0)
    votes_against = Column(Integer, default=0)
    abstentions = Column(Integer, default=0)
    individual_votes = Column(Text, default="{}")  # JSON {iso3: vote}
    result = Column(String)              # passed|failed|no_action
    voted_at = Column(String)

class Directive(Base):
    __tablename__ = "coord_directives"
    id = Column(Integer, primary_key=True, index=True)
    committee_id = Column(Integer, nullable=False, index=True)
    session_id = Column(Integer, nullable=False)
    from_country = Column(String(3))
    directive_type = Column(String)   # intelligence|action|press|back_room
    content = Column(Text)
    priority = Column(String, default="normal")
    status = Column(String, default="submitted")   # submitted|approved|rejected|executed
    chair_response = Column(Text, default="")
    submitted_at = Column(String)

class PressRelease(Base):
    __tablename__ = "coord_press"
    id = Column(Integer, primary_key=True, index=True)
    committee_id = Column(Integer, nullable=False, index=True)
    session_id = Column(Integer, nullable=False)
    country_iso3 = Column(String(3))
    headline = Column(String)
    body = Column(Text)
    is_public = Column(Boolean, default=True)
    published_at = Column(String)

class Archive(Base):
    __tablename__ = "coord_archives"
    id = Column(Integer, primary_key=True, index=True)
    committee_id = Column(Integer, nullable=False, index=True)
    archived_at = Column(String)
    session_count = Column(Integer, default=0)
    snapshot = Column(Text, default="{}")
