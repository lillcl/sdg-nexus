"""
Moodle-style LMS router
- admin/superadmin = teachers: create courses, post lessons, create tasks, grade
- student = students: enroll, read, submit tasks
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.core.supabase import get_supabase, get_supabase_admin
from app.routers.auth_supabase import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/moodle", tags=["moodle"])

# ── Pydantic models ───────────────────────────────────────────────────────────
class CourseCreate(BaseModel):
    title: str
    description: str = ""
    sdg_focus: str = ""

class LessonCreate(BaseModel):
    course_id: str
    title: str
    content: str          # markdown/rich text
    order: int = 0

class TaskCreate(BaseModel):
    course_id: str
    title: str
    description: str
    due_date: Optional[str] = None   # ISO date string
    max_points: int = 100

class SubmissionCreate(BaseModel):
    task_id: str
    content: str          # text response
    notes: str = ""

class GradeCreate(BaseModel):
    submission_id: str
    points: int
    feedback: str = ""

def _is_teacher(user: dict) -> bool:
    return user["role"] in ("admin", "superadmin")

def _is_student(user: dict) -> bool:
    return user["role"] in ("student", "admin", "superadmin")

# ── Courses ───────────────────────────────────────────────────────────────────
@router.get("/courses")
async def list_courses():
    """Public: list all courses"""
    sb = get_supabase()
    try:
        r = sb.table("moodle_courses").select("*").order("created_at", desc=False).execute()
        return r.data
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/courses", status_code=201)
async def create_course(req: CourseCreate, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        r = sb.table("moodle_courses").insert({
            "title": req.title, "description": req.description,
            "sdg_focus": req.sdg_focus, "teacher_id": user["id"]
        }).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

@router.delete("/courses/{course_id}")
async def delete_course(course_id: str, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        sb.table("moodle_courses").delete().eq("id", course_id).execute()
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(400, str(e))

# ── Lessons ───────────────────────────────────────────────────────────────────
@router.get("/courses/{course_id}/lessons")
async def list_lessons(course_id: str):
    sb = get_supabase()
    try:
        r = sb.table("moodle_lessons").select("*").eq("course_id", course_id).order("order", desc=False).execute()
        return r.data
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/lessons", status_code=201)
async def create_lesson(req: LessonCreate, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        r = sb.table("moodle_lessons").insert({
            "course_id": req.course_id, "title": req.title,
            "content": req.content, "order": req.order
        }).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

@router.put("/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, req: LessonCreate, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        r = sb.table("moodle_lessons").update({
            "title": req.title, "content": req.content, "order": req.order
        }).eq("id", lesson_id).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

@router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        sb.table("moodle_lessons").delete().eq("id", lesson_id).execute()
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(400, str(e))

# ── Tasks ─────────────────────────────────────────────────────────────────────
@router.get("/courses/{course_id}/tasks")
async def list_tasks(course_id: str):
    sb = get_supabase()
    try:
        r = sb.table("moodle_tasks").select("*").eq("course_id", course_id).order("created_at").execute()
        return r.data
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/tasks", status_code=201)
async def create_task(req: TaskCreate, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        r = sb.table("moodle_tasks").insert({
            "course_id": req.course_id, "title": req.title,
            "description": req.description, "due_date": req.due_date,
            "max_points": req.max_points
        }).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        sb.table("moodle_tasks").delete().eq("id", task_id).execute()
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(400, str(e))

# ── Submissions ───────────────────────────────────────────────────────────────
@router.get("/tasks/{task_id}/submissions")
async def list_submissions(task_id: str, user=Depends(get_current_user)):
    sb = get_supabase()
    try:
        if _is_teacher(user):
            r = sb.table("moodle_submissions").select("*").eq("task_id", task_id).execute()
        else:
            r = sb.table("moodle_submissions").select("*").eq("task_id", task_id).eq("student_id", user["id"]).execute()
        return r.data
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/submissions", status_code=201)
async def submit_task(req: SubmissionCreate, user=Depends(get_current_user)):
    if not _is_student(user):
        raise HTTPException(403, "Students only")
    sb = get_supabase()
    try:
        # Check not already submitted
        existing = sb.table("moodle_submissions").select("id").eq("task_id", req.task_id).eq("student_id", user["id"]).execute()
        if existing.data:
            r = sb.table("moodle_submissions").update({
                "content": req.content, "notes": req.notes
            }).eq("id", existing.data[0]["id"]).execute()
        else:
            r = sb.table("moodle_submissions").insert({
                "task_id": req.task_id, "student_id": user["id"],
                "content": req.content, "notes": req.notes
            }).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

# ── Grades ────────────────────────────────────────────────────────────────────
@router.post("/grade", status_code=201)
async def grade_submission(req: GradeCreate, user=Depends(get_current_user)):
    if not _is_teacher(user):
        raise HTTPException(403, "Teachers only")
    sb = get_supabase()
    try:
        r = sb.table("moodle_submissions").update({
            "points": req.points, "feedback": req.feedback, "graded": True
        }).eq("id", req.submission_id).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

# ── Enrollment ────────────────────────────────────────────────────────────────
@router.post("/courses/{course_id}/enroll")
async def enroll(course_id: str, user=Depends(get_current_user)):
    sb = get_supabase()
    try:
        existing = sb.table("moodle_enrollments").select("id").eq("course_id", course_id).eq("user_id", user["id"]).execute()
        if existing.data:
            return {"message": "Already enrolled"}
        r = sb.table("moodle_enrollments").insert({"course_id": course_id, "user_id": user["id"]}).execute()
        return r.data[0]
    except Exception as e:
        raise HTTPException(400, str(e))

@router.get("/my-courses")
async def my_courses(user=Depends(get_current_user)):
    sb = get_supabase()
    try:
        if _is_teacher(user):
            r = sb.table("moodle_courses").select("*").eq("teacher_id", user["id"]).execute()
        else:
            enr = sb.table("moodle_enrollments").select("course_id").eq("user_id", user["id"]).execute()
            ids = [e["course_id"] for e in enr.data]
            if not ids:
                return []
            r = sb.table("moodle_courses").select("*").in_("id", ids).execute()
        return r.data
    except Exception as e:
        raise HTTPException(400, str(e))
