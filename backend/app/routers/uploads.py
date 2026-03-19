"""
File upload router — stores SVGs/images on disk (not DB).
Files saved to ./static/uploads/ and served at /static/uploads/<filename>
"""
import os, uuid, shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from app.routers.auth_supabase import get_current_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Directory relative to where uvicorn runs (backend root)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/svg+xml", "image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/svg")
async def upload_svg(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload an SVG or image file. Superadmin/admin only. Returns public URL."""
    if current_user["role"] not in ["superadmin", "admin"]:
        raise HTTPException(403, "Admin only")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported type: {file.content_type}. Allowed: SVG, PNG, JPEG, WEBP, GIF")
    
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(400, "File too large (max 5MB)")
    
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "svg"
    safe_name = f"{uuid.uuid4().hex}.{ext}"
    dest = os.path.join(UPLOAD_DIR, safe_name)
    
    with open(dest, "wb") as f:
        f.write(data)
    
    return {"filename": safe_name, "url": f"/static/uploads/{safe_name}", "original": file.filename}


@router.post("/icon")
async def upload_app_icon(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload app icon SVG — overwrites icon.svg. Superadmin only."""
    if current_user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin only")
    if file.content_type not in {"image/svg+xml", "image/png"}:
        raise HTTPException(400, "Only SVG or PNG allowed for app icon")
    
    data = await file.read()
    if len(data) > 2 * 1024 * 1024:
        raise HTTPException(400, "Icon too large (max 2MB)")
    
    ext = "svg" if file.content_type == "image/svg+xml" else "png"
    dest = os.path.join(UPLOAD_DIR, f"app-icon.{ext}")
    with open(dest, "wb") as f:
        f.write(data)
    
    return {"filename": f"app-icon.{ext}", "url": f"/static/uploads/app-icon.{ext}"}


@router.get("/list")
async def list_uploads(current_user: dict = Depends(get_current_user)):
    """List all uploaded files."""
    if current_user["role"] not in ["superadmin", "admin"]:
        raise HTTPException(403, "Admin only")
    files = []
    for fname in os.listdir(UPLOAD_DIR):
        fpath = os.path.join(UPLOAD_DIR, fname)
        files.append({
            "filename": fname,
            "url": f"/static/uploads/{fname}",
            "size": os.path.getsize(fpath),
        })
    return {"files": files}


@router.delete("/{filename}")
async def delete_upload(filename: str, current_user: dict = Depends(get_current_user)):
    """Delete an uploaded file. Superadmin only."""
    if current_user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin only")
    # Sanitize
    safe = os.path.basename(filename)
    fpath = os.path.join(UPLOAD_DIR, safe)
    if not os.path.exists(fpath):
        raise HTTPException(404, "File not found")
    os.remove(fpath)
    return {"deleted": safe}
