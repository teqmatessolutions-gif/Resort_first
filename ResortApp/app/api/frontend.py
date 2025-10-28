from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import uuid

import app.schemas.frontend as schemas
import app.models.frontend as models
from app.models.user import User
import app.curd.frontend as crud
from app.utils.auth import get_db, get_current_user

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------- Header & Banner ----------
@router.get("/header-banner/", response_model=list[schemas.HeaderBanner])
def list_header_banner(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.HeaderBanner, skip=skip, limit=limit)


# ✅ Create header banner
@router.post("/header-banner/", response_model=schemas.HeaderBanner)
async def create_header_banner(
    title: str = Form(...),
    subtitle: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate unique filename to avoid conflicts
    file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
    unique_filename = f"banner_{uuid.uuid4().hex}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    normalized_path = file_path.replace('\\', '/')
    obj = schemas.HeaderBannerCreate(
        title=title,
        subtitle=subtitle,
        is_active=is_active,
        image_url=f"/{normalized_path}"
    )
    return crud.create(db, models.HeaderBanner, obj)


# ✅ Update header banner
@router.put("/header-banner/{item_id}", response_model=schemas.HeaderBanner)
async def update_header_banner(
    item_id: int,
    title: str = Form(...),
    subtitle: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = None
    if image:
        file_path = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        normalized_path = file_path.replace('\\', '/')
        image_url = f"/{normalized_path}"

    obj = schemas.HeaderBannerUpdate(
        title=title,
        subtitle=subtitle,
        is_active=is_active,
        image_url=image_url
    )
    return crud.update(db, models.HeaderBanner, item_id, obj)


# ✅ Delete header banner
@router.delete("/header-banner/{item_id}")
def delete_header_banner(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.HeaderBanner, item_id)

# ---------- Check Availability ----------
@router.get("/check-availability/", response_model=list[schemas.CheckAvailability])
def list_check_availability(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.CheckAvailability, skip=skip, limit=limit)


@router.post("/check-availability/", response_model=schemas.CheckAvailability)
def create_check_availability(obj: schemas.CheckAvailabilityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create(db, models.CheckAvailability, obj)


@router.put("/check-availability/{item_id}", response_model=schemas.CheckAvailability)
def update_check_availability(item_id: int, obj: schemas.CheckAvailabilityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.update(db, models.CheckAvailability, item_id, obj)


@router.delete("/check-availability/{item_id}")
def delete_check_availability(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.CheckAvailability, item_id)


# ---------- Gallery ----------
@router.get("/gallery/", response_model=list[schemas.Gallery])
def list_gallery(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.Gallery, skip=skip, limit=limit)


@router.post("/gallery/", response_model=schemas.Gallery)
async def create_gallery(
    caption: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    normalized_path = file_path.replace('\\', '/')
    obj = schemas.GalleryCreate(
        caption=caption,
        is_active=is_active,
        image_url=f"/{normalized_path}"
    )
    return crud.create(db, models.Gallery, obj)


@router.put("/gallery/{item_id}", response_model=schemas.Gallery)
async def update_gallery(
    item_id: int,
    caption: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = None
    if image:
        file_path = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        normalized_path = file_path.replace('\\', '/')
        image_url = f"/{normalized_path}"

    obj = schemas.GalleryCreate(
        caption=caption,
        is_active=is_active,
        image_url=image_url
    )
    return crud.update(db, models.Gallery, item_id, obj)


@router.delete("/gallery/{item_id}")
def delete_gallery(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.Gallery, item_id)


# ---------- Reviews ----------
@router.get("/reviews/", response_model=list[schemas.Review])
def list_reviews(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.Review, skip=skip, limit=limit)


@router.post("/reviews/", response_model=schemas.Review)
def create_review(obj: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create(db, models.Review, obj)


@router.put("/reviews/{item_id}", response_model=schemas.Review)
def update_review(item_id: int, obj: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.update(db, models.Review, item_id, obj)


@router.delete("/reviews/{item_id}")
def delete_review(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.Review, item_id)


# ---------- Resort Info ----------
@router.get("/resort-info/", response_model=list[schemas.ResortInfo])
def list_resort_info(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.ResortInfo, skip=skip, limit=limit)


@router.post("/resort-info/", response_model=schemas.ResortInfo)
def create_resort_info(
    obj: schemas.ResortInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create(db, models.ResortInfo, obj)


@router.put("/resort-info/{item_id}", response_model=schemas.ResortInfo)
def update_resort_info(
    item_id: int,
    obj: schemas.ResortInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.update(db, models.ResortInfo, item_id, obj)


@router.delete("/resort-info/{item_id}")
def delete_resort_info(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.ResortInfo, item_id)


# ---------- Signature Experiences ----------
@router.get("/signature-experiences/", response_model=list[schemas.SignatureExperience])
def list_signature_experiences(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.SignatureExperience, skip=skip, limit=limit)


@router.post("/signature-experiences/", response_model=schemas.SignatureExperience)
async def create_signature_experience(
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    normalized_path = file_path.replace('\\', '/')
    obj = schemas.SignatureExperienceCreate(
        title=title,
        description=description,
        is_active=is_active,
        image_url=f"/{normalized_path}"
    )
    return crud.create(db, models.SignatureExperience, obj)


@router.put("/signature-experiences/{item_id}", response_model=schemas.SignatureExperience)
async def update_signature_experience(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = {
        "title": title,
        "description": description,
        "is_active": is_active,
    }
    
    if image:
        file_path = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        normalized_path = file_path.replace('\\', '/')
        update_data["image_url"] = f"/{normalized_path}"

    obj = schemas.SignatureExperienceUpdate(**update_data)
    return crud.update(db, models.SignatureExperience, item_id, obj)


@router.delete("/signature-experiences/{item_id}")
def delete_signature_experience(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.SignatureExperience, item_id)


# ---------- Plan Your Wedding ----------
@router.get("/plan-weddings/", response_model=list[schemas.PlanWedding])
def list_plan_weddings(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.PlanWedding, skip=skip, limit=limit)


@router.post("/plan-weddings/", response_model=schemas.PlanWedding)
async def create_plan_wedding(
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    normalized_path = file_path.replace('\\', '/')
    obj = schemas.PlanWeddingCreate(
        title=title,
        description=description,
        is_active=is_active,
        image_url=f"/{normalized_path}"
    )
    return crud.create(db, models.PlanWedding, obj)


@router.put("/plan-weddings/{item_id}", response_model=schemas.PlanWedding)
async def update_plan_wedding(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = {
        "title": title,
        "description": description,
        "is_active": is_active,
    }
    
    if image:
        file_path = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        normalized_path = file_path.replace('\\', '/')
        update_data["image_url"] = f"/{normalized_path}"

    obj = schemas.PlanWeddingUpdate(**update_data)
    return crud.update(db, models.PlanWedding, item_id, obj)


@router.delete("/plan-weddings/{item_id}")
def delete_plan_wedding(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.PlanWedding, item_id)


# ---------- Nearby Attractions ----------
@router.get("/nearby-attractions/", response_model=list[schemas.NearbyAttraction])
def list_nearby_attractions(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_all(db, models.NearbyAttraction, skip=skip, limit=limit)


@router.post("/nearby-attractions/", response_model=schemas.NearbyAttraction)
async def create_nearby_attraction(
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    normalized_path = file_path.replace('\\', '/')
    obj = schemas.NearbyAttractionCreate(
        title=title,
        description=description,
        is_active=is_active,
        image_url=f"/{normalized_path}"
    )
    return crud.create(db, models.NearbyAttraction, obj)


@router.put("/nearby-attractions/{item_id}", response_model=schemas.NearbyAttraction)
async def update_nearby_attraction(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = {
        "title": title,
        "description": description,
        "is_active": is_active,
    }
    
    if image:
        file_path = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        normalized_path = file_path.replace('\\', '/')
        update_data["image_url"] = f"/{normalized_path}"

    obj = schemas.NearbyAttractionUpdate(**update_data)
    return crud.update(db, models.NearbyAttraction, item_id, obj)


@router.delete("/nearby-attractions/{item_id}")
def delete_nearby_attraction(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.NearbyAttraction, item_id)