from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.room import RoomCreate, RoomOut
from app.curd import room as crud_room
from app.models.room import Room
from app.models.user import User
from app.utils.auth import get_current_user
import shutil
import os
from uuid import uuid4

router = APIRouter(prefix="/rooms", tags=["Rooms"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = os.path.join("static", "rooms")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------- CREATE ----------------
@router.post("/", response_model=RoomOut)
def create_room(
    number: str = Form(...),
    type: str = Form(...),
    price: float = Form(...),
    status: str = Form("Available"),
    adults: int = Form(2),
    children: int = Form(0),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = None
    if image:
        ext = image.filename.split('.')[-1]
        filename = f"room_{uuid4().hex}.{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    db_room = Room(
        number=number,
        type=type,
        price=price,
        status=status,
        adults=adults,
        children=children,
        image_url=f"/static/rooms/{filename}" if filename else None
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


# ---------------- READ ----------------
@router.get("/", response_model=list[RoomOut])
def get_rooms(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    # Query directly in the endpoint to apply pagination
    return db.query(Room).offset(skip).limit(limit).all()


# ---------------- DELETE ----------------
@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    # Delete associated image if exists
    if db_room.image_url:
        image_path = db_room.image_url.lstrip("/")
        if os.path.exists(image_path):
            os.remove(image_path)

    db.delete(db_room)
    db.commit()
    return {"message": "Room deleted successfully"}


# ---------------- UPDATE ----------------
@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    number: str = Form(None),
    type: str = Form(None),
    price: float = Form(None),
    status: str = Form(None),
    adults: int = Form(None),
    children: int = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Update fields if provided
    if number:
        db_room.number = number
    if type:
        db_room.type = type
    if price is not None:
        db_room.price = price
    if status:
        db_room.status = status
    if adults is not None:
        db_room.adults = adults
    if children is not None:
        db_room.children = children

    # Handle new image upload if provided
    if image:
        # Remove old image if exists
        if db_room.image_url:
            old_path = db_room.image_url.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)

        ext = image.filename.split(".")[-1]
        filename = f"room_{uuid4().hex}.{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_room.image_url = f"/static/rooms/{filename}"

    db.commit()
    db.refresh(db_room)
    return db_room
