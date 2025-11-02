from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from app.curd import food_item
from app.schemas.food_item import FoodItemCreate
from app.models.user import User
import os, shutil, uuid
from app.utils.auth import get_db, get_current_user

router = APIRouter(prefix="/food-items", tags=["FoodItem"])
UPLOAD_DIR = "uploads/food_items"
os.makedirs(UPLOAD_DIR, exist_ok=True)



@router.post("/")
async def create_item(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    available: bool = Form(...),
    category_id: int = Form(...),
    images: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_paths = []
    for image in images:
        # Generate unique filename
        filename = f"food_{uuid.uuid4().hex}_{image.filename}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        # Store with leading slash for proper URL construction
        web_path = f"/{UPLOAD_DIR}/{filename}".replace("\\", "/")
        image_paths.append(web_path)

    item_data = FoodItemCreate(
        name=name, description=description, price=price,
        available=available, category_id=category_id
    )
    return food_item.create_food_item(db, item_data, image_paths)

@router.get("/")
def list_items(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    return food_item.get_all_food_items(db, skip=skip, limit=limit)

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return food_item.delete_food_item(db, item_id)

@router.patch("/{item_id}/toggle-availability")
def toggle_availability(item_id: int, available: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return food_item.update_food_item_availability(db, item_id, available)
