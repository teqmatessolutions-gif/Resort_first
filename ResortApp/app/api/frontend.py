from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil

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
    file_path = f"{UPLOAD_DIR}/{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    obj = schemas.HeaderBannerCreate(
        title=title,
        subtitle=subtitle,
        is_active=is_active,
        image_url=file_path.replace("\\", "/")
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
        image_url = file_path.replace("\\", "/")

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

    obj = schemas.GalleryCreate(
        caption=caption,
        is_active=is_active,
        image_url=f"/{file_path}"
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
        image_url = f"/{file_path}"

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