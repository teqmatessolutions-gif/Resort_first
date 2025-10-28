from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
import os
import shutil
import uuid
from app.schemas import service as service_schema
from app.models.user import User
from app.curd import service as service_crud
from app.utils.auth import get_db, get_current_user

router = APIRouter(prefix="/services", tags=["Services"])

UPLOAD_DIR = "uploads/services"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Service CRUD
@router.post("/", response_model=service_schema.ServiceOut)
async def create_service(
    name: str = Form(...),
    description: str = Form(...),
    charges: float = Form(...),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_urls = []
    for img in images:
        # Generate unique filename
        filename = f"svc_{uuid.uuid4().hex}_{img.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(img.file, buffer)
        # Store with leading slash for proper URL construction
        normalized_path = file_path.replace('\\', '/')
        image_urls.append(f"/{normalized_path}")
    
    return service_crud.create_service(db, name, description, charges, image_urls)

@router.get("/", response_model=List[service_schema.ServiceOut])
def list_services(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return service_crud.get_services(db, skip=skip, limit=limit)

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = service_crud.delete_service(db, service_id)
    if not success:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"detail": "Deleted successfully"}

# Assigned Services
@router.post("/assign", response_model=service_schema.AssignedServiceOut)
def assign_service(payload: service_schema.AssignedServiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service_crud.create_assigned_service(db, payload)

@router.get("/assigned", response_model=List[service_schema.AssignedServiceOut])
def get_all_assigned_services(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return service_crud.get_assigned_services(db, skip=skip, limit=limit)

@router.patch("/assigned/{assigned_id}")
def update_assigned_status(
    assigned_id: int,
    status_update: service_schema.AssignedServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service_crud.update_assigned_service_status(db, assigned_id, status_update)

@router.delete("/assigned/{assigned_id}")
def delete_assigned_service(assigned_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = service_crud.delete_assigned_service(db, assigned_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assigned service not found")
    return {"detail": "Deleted successfully"}
