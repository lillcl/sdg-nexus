"""
Authentication router using Supabase
Supports 4 roles: visitor, student, admin, superadmin
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from app.core.supabase import get_supabase, get_supabase_admin
from app.core.rate_limit import check_rate_limit
from fastapi import Request
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    full_name: str = ""
    role: str = "visitor"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RoleRequestModel(BaseModel):
    requested_role: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str = ""
    token_type: str = "bearer"
    user: dict


async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        supabase = get_supabase()
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        role_data = supabase.table("roles").select("*").eq("user_id", user.user.id).execute()
        return {
            "id": user.user.id,
            "email": user.user.email,
            "role": role_data.data[0]["role"] if role_data.data else "visitor",
            "requested_role": role_data.data[0].get("requested_role") if role_data.data else None,
            "username": user.user.user_metadata.get("username", ""),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[auth] get_current_user error: {e}")
        raise HTTPException(status_code=401, detail="Token validation failed")


@router.post("/register", status_code=201)
async def register(req: RegisterRequest, request: Request = None, _rl=Depends(check_rate_limit)):
    logger.info(f"[auth] Register attempt: {req.email}")
    try:
        supabase = get_supabase_admin()
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "username": req.username,
                    "full_name": req.full_name,
                }
            }
        })
        logger.debug(f"[auth] sign_up response: user={auth_response.user}")
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed – no user returned")

        try:
            supabase.table("roles").insert({
                "user_id": auth_response.user.id,
                "role": "visitor",
                "status": "active",
            }).execute()
        except Exception as role_err:
            logger.warning(f"[auth] Could not insert role row (may already exist): {role_err}")

        return {
            "message": "Registration successful. Check your email to confirm your account.",
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "role": "visitor",
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[auth] Register error: {e}")
        detail = str(e)
        if "already registered" in detail.lower() or "already exists" in detail.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=detail)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, request: Request = None, _rl=Depends(check_rate_limit)):
    logger.info(f"[auth] Login attempt: {req.email}")
    try:
        supabase = get_supabase()
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
        logger.debug(f"[auth] sign_in response: session={bool(auth_response.session)}")
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        role_data = supabase.table("roles").select("*").eq("user_id", auth_response.user.id).execute()
        user_role = role_data.data[0]["role"] if role_data.data else "visitor"

        return TokenResponse(
            access_token=auth_response.session.access_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "role": user_role,
                "username": auth_response.user.user_metadata.get("username", ""),
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[auth] Login error: {e}")
        detail = str(e)
        if "invalid" in detail.lower() or "credentials" in detail.lower():
            raise HTTPException(status_code=401, detail="Invalid email or password")
        raise HTTPException(status_code=401, detail=detail)


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    try:
        supabase = get_supabase()
        supabase.auth.sign_out()
    except Exception:
        pass
    return {"message": "Logged out"}


@router.post("/request-role")
async def request_role(req: RoleRequestModel, current_user: dict = Depends(get_current_user)):
    valid_roles = ["student", "admin", "superadmin"]
    if req.requested_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    supabase = get_supabase()
    try:
        supabase.table("roles").update({"requested_role": req.requested_role}).eq("user_id", current_user["id"]).execute()
        return {"message": f"Role upgrade request submitted for {req.requested_role}", "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/approve-role/{user_id}")
async def approve_role(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can approve roles")
    supabase = get_supabase()
    try:
        role_data = supabase.table("roles").select("*").eq("user_id", user_id).execute()
        if not role_data.data or not role_data.data[0].get("requested_role"):
            raise HTTPException(status_code=400, detail="No role request found")
        requested_role = role_data.data[0]["requested_role"]
        supabase.table("roles").update({"role": requested_role, "requested_role": None}).eq("user_id", user_id).execute()
        return {"message": f"Role upgraded to {requested_role}", "user_id": user_id, "new_role": requested_role}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/role-requests")
async def get_role_requests(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can view role requests")
    supabase = get_supabase()
    try:
        requests = supabase.table("roles").select("*").not_.is_("requested_role", "null").execute()
        return {"requests": requests.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users")
async def list_users(current_user: dict = Depends(get_current_user)):
    """List all users from roles table + auth.users — admin/superadmin only"""
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        supabase_admin = get_supabase_admin()
        # Fetch all roles
        roles = supabase_admin.table("roles").select("*").execute()
        roles_map = {row.get("user_id"): row for row in (roles.data or [])}

        # Try to fetch auth users for emails
        email_map = {}
        try:
            auth_users = supabase_admin.auth.admin.list_users()
            for au in (auth_users or []):
                uid = getattr(au, 'id', None)
                email = getattr(au, 'email', None)
                if uid:
                    email_map[uid] = email
                    # Ensure visitor users who logged in but have no roles entry appear
                    if uid not in roles_map:
                        roles_map[uid] = {"user_id": uid, "role": "visitor", "requested_role": None, "status": "active"}
        except Exception as ae:
            logger.warning(f"[auth] Could not list auth users: {ae}")

        users = []
        for uid, row in roles_map.items():
            users.append({
                "user_id": uid,
                "email": email_map.get(uid, row.get("email", "")),
                "role": row.get("role", "visitor"),
                "requested_role": row.get("requested_role"),
                "status": row.get("status", "active"),
            })
        return {"users": users, "total": len(users)}
    except Exception as e:
        logger.error(f"[auth] list_users error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}/role")
async def set_user_role(user_id: str, req: RoleRequestModel, current_user: dict = Depends(get_current_user)):
    """Directly set a user's role (superadmin only)"""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can set roles")
    valid_roles = ["visitor", "student", "admin", "superadmin"]
    if req.requested_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    supabase = get_supabase()
    try:
        supabase.table("roles").update({"role": req.requested_role, "requested_role": None}).eq("user_id", user_id).execute()
        return {"message": f"Role set to {req.requested_role}", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── V23: Superadmin user creation ─────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    username: str = ""
    full_name: str = ""
    role: str = "student"

class BatchCreateRequest(BaseModel):
    users: list[dict]  # [{email, password, username, full_name, role}, ...]

class AssignTeacherRequest(BaseModel):
    student_ids: list[str]

@router.post("/admin/create-user", status_code=201)
async def admin_create_user(req: CreateUserRequest, current_user: dict = Depends(get_current_user)):
    """Superadmin creates a user with a specific role immediately."""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin only")
    valid_roles = ["visitor", "student", "admin", "superadmin"]
    if req.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    try:
        supabase = get_supabase_admin()
        # Create auth user (email confirmed immediately via admin API)
        auth_resp = supabase.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {"username": req.username, "full_name": req.full_name},
        })
        if not auth_resp.user:
            raise HTTPException(status_code=400, detail="User creation failed")
        uid = auth_resp.user.id
        # Upsert role
        supabase.table("roles").upsert({
            "user_id": uid, "role": req.role, "status": "active"
        }).execute()
        return {"message": f"User created with role {req.role}", "user_id": uid, "email": req.email, "role": req.role}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[auth] admin_create_user error: {e}")
        detail = str(e)
        if "already" in detail.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=detail)


@router.post("/admin/batch-create-users", status_code=201)
async def batch_create_users(req: BatchCreateRequest, current_user: dict = Depends(get_current_user)):
    """Superadmin batch-creates users from CSV upload."""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin only")
    supabase = get_supabase_admin()
    results = []
    for u in req.users:
        try:
            role = u.get("role", "student")
            auth_resp = supabase.auth.admin.create_user({
                "email": u["email"],
                "password": u.get("password", "ChangeMe123!"),
                "email_confirm": True,
                "user_metadata": {"username": u.get("username",""), "full_name": u.get("full_name","")},
            })
            if auth_resp.user:
                supabase.table("roles").upsert({"user_id": auth_resp.user.id, "role": role, "status": "active"}).execute()
                results.append({"email": u["email"], "status": "created", "role": role})
            else:
                results.append({"email": u["email"], "status": "failed", "error": "no user returned"})
        except Exception as e:
            results.append({"email": u.get("email","?"), "status": "failed", "error": str(e)})
    created = sum(1 for r in results if r["status"] == "created")
    return {"created": created, "total": len(req.users), "results": results}


@router.post("/admin/assign-teacher/{teacher_id}")
async def assign_students_to_teacher(
    teacher_id: str, req: AssignTeacherRequest, current_user: dict = Depends(get_current_user)
):
    """Assign one or more students to a teacher."""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin only")
    supabase = get_supabase_admin()
    rows = [{"teacher_id": teacher_id, "student_id": sid} for sid in req.student_ids]
    try:
        supabase.table("teacher_student_assignments").upsert(rows).execute()
        return {"message": f"Assigned {len(rows)} students to teacher {teacher_id}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/admin/teacher-students/{teacher_id}")
async def get_teacher_students(teacher_id: str, current_user: dict = Depends(get_current_user)):
    """Get all students assigned to a teacher."""
    if current_user["role"] not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    supabase = get_supabase_admin()
    try:
        rows = supabase.table("teacher_student_assignments").select("*").eq("teacher_id", teacher_id).execute()
        return {"teacher_id": teacher_id, "students": rows.data or []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
