from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.models.classroom import Classroom, ProjectTopic, Submission
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/classroom", tags=["classroom"])

class ClassroomCreate(BaseModel):
    name: str
    sdg_focus: str
    level: str = "secondary"

class TopicCreate(BaseModel):
    classroom_id: int
    title: str
    problem_statement: str
    prototype_brief: str
    difficulty: int = 3
    domain: str = "tech"
    sdg_goal: int = 1
    rubric: str = ""

class SubmissionCreate(BaseModel):
    topic_id: int
    description: str
    prototype_url: str = ""
    reflection: str = ""

@router.post("/classrooms", status_code=201)
async def create_classroom(req: ClassroomCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    c = Classroom(**req.model_dump(), teacher_id=user.id)
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return c

@router.get("/classrooms")
async def list_classrooms(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Classroom).where(Classroom.teacher_id == user.id))
    return result.scalars().all()

@router.post("/topics", status_code=201)
async def create_topic(req: TopicCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    t = ProjectTopic(**req.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return t

@router.get("/classrooms/{id}/topics")
async def list_topics(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(ProjectTopic).where(ProjectTopic.classroom_id == id))
    return result.scalars().all()

@router.post("/submissions", status_code=201)
async def submit(req: SubmissionCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    s = Submission(**req.model_dump(), student_id=user.id)
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s

@router.get("/topics/{id}/submissions")
async def topic_submissions(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Submission).where(Submission.topic_id == id))
    return result.scalars().all()
