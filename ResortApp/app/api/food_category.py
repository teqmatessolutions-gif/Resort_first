from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.schemas.food_category import *
from app.curd import food_category as crud
from app.utils.auth import get_db, get_current_user
from app.models.food_category import FoodCategory
from app.models.user import User
import os, shutil, uuid
import uuid,os, shutil
UPLOAD_DIR = "static/food_categories"
os.makedirs(UPLOAD_DIR, exist_ok=True)
router = APIRouter(prefix="/food-categories", tags=["Food Categories"])


@router.post("/", response_model=FoodCategoryOut)
def create_category(name: str = Form(...), image: UploadFile = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    filename = None
    if image:
        filename = f"category_{uuid.uuid4().hex}_{image.filename}"
        path = os.path.join("static/food_categories", filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    
    category = FoodCategory(name=name, image=filename)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/", response_model=list[FoodCategoryOut])
def read_all(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud.get_categories(db, skip=skip, limit=limit)

@router.put("/{cat_id}", response_model=FoodCategoryOut)
def update(cat_id: int, data: FoodCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.update_category(db, cat_id, data.name)

@router.delete("/{cat_id}")
def delete(cat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete_category(db, cat_id)
