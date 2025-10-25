# booking.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session, joinedload, load_only
from typing import List
from app.utils.auth import get_db, get_current_user
from app.models.booking import Booking, BookingRoom
from app.models.user import User
from app.models.room import Room
from app.models.Package import Package, PackageBooking, PackageBookingRoom
from app.schemas.booking import BookingCreate, BookingOut
from app.schemas.room import RoomOut
from fastapi.responses import FileResponse
import os
import shutil
import uuid

UPLOAD_DIR = "uploads/checkin_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
from app.schemas.booking import BookingOut, BookingRoomOut
from pydantic import BaseModel

class PaginatedBookingResponse(BaseModel):
    total: int
    bookings: List[BookingOut]

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.get("", response_model=PaginatedBookingResponse)
def get_bookings(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, order_by: str = "id", order: str = "desc"):
    try:
        # Get regular bookings with room details, ordered by latest first
        query = db.query(Booking).options(
            joinedload(Booking.booking_rooms).joinedload(BookingRoom.room),
            joinedload(Booking.user)
        )
        
        # Apply ordering
        if order_by == "id" and order == "desc":
            query = query.order_by(Booking.id.desc())
        elif order_by == "id" and order == "asc":
            query = query.order_by(Booking.id.asc())
        elif order_by == "check_in" and order == "desc":
            query = query.order_by(Booking.check_in.desc())
        elif order_by == "check_in" and order == "asc":
            query = query.order_by(Booking.check_in.asc())
        
        regular_bookings = query.offset(skip).limit(limit).all()
        
        # Convert to BookingOut format
        booking_results = []
        for booking in regular_bookings:
            booking_out = BookingOut(
                id=booking.id,
                guest_name=booking.guest_name,
                guest_mobile=booking.guest_mobile,
                guest_email=booking.guest_email,
                status=booking.status,
                check_in=booking.check_in,
                check_out=booking.check_out,
                adults=booking.adults,
                children=booking.children,
                id_card_image_url=getattr(booking, 'id_card_image_url', None),
                guest_photo_url=getattr(booking, 'guest_photo_url', None),
                user=booking.user,
                is_package=False,
                rooms=[br.room for br in booking.booking_rooms if br.room]
            )
            booking_results.append(booking_out)
        
        # Get total count
        total_count = db.query(Booking).count()
        
        return {"total": total_count, "bookings": booking_results}
    except Exception as e:
        print(f"Error fetching bookings: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")

# ----------------------------------------------------------------
# GET Detailed view for a SINGLE booking (regular or package)
# This is a more reliable way to get full details for the modal view.
# ----------------------------------------------------------------
@router.get("/details/{booking_id}", response_model=BookingOut)
def get_booking_details(booking_id: int, is_package: bool, db: Session = Depends(get_db)):
    if is_package:
        booking = db.query(PackageBooking).options(
            joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room),
            joinedload(PackageBooking.user),
            joinedload(PackageBooking.package)
        ).filter(PackageBooking.id == booking_id).first()

        if not booking:
            raise HTTPException(status_code=404, detail="Package booking not found")

        return BookingOut(
            id=booking.id,
            guest_name=booking.guest_name,
            guest_mobile=booking.guest_mobile,
            guest_email=booking.guest_email,
            status=booking.status,
            check_in=booking.check_in,
            check_out=booking.check_out,
            adults=booking.adults,
            children=booking.children,
            id_card_image_url=getattr(booking, 'id_card_image_url', None),
            guest_photo_url=getattr(booking, 'guest_photo_url', None),
            user=booking.user,
            is_package=True,
            rooms=[pbr.room for pbr in booking.rooms if pbr.room]
        )
    else: # Regular booking
        booking = db.query(Booking).options(
            joinedload(Booking.booking_rooms).joinedload(BookingRoom.room),
            joinedload(Booking.user)
        ).filter(Booking.id == booking_id).first()

        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Manually construct the response to ensure rooms and image URLs are correctly populated
        return BookingOut(
            id=booking.id,
            guest_name=booking.guest_name,
            guest_mobile=booking.guest_mobile,
            guest_email=booking.guest_email,
            status=booking.status,
            check_in=booking.check_in,
            check_out=booking.check_out,
            adults=booking.adults,
            children=booking.children,
            id_card_image_url=getattr(booking, 'id_card_image_url', None),
            guest_photo_url=getattr(booking, 'guest_photo_url', None),
            user=booking.user,
            is_package=False,
            rooms=[br.room for br in booking.booking_rooms if br.room]
        )


# -------------------------------
# POST a new booking
# -------------------------------
@router.post("", response_model=BookingOut) # Changed from "/" to ""
def create_booking(booking: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check for an existing booking to reuse guest details for consistency
    existing_booking = db.query(Booking).filter(
        (Booking.guest_email == booking.guest_email) & (Booking.guest_mobile == booking.guest_mobile)
    ).order_by(Booking.id.desc()).first()

    guest_name_to_use = booking.guest_name
    if existing_booking:
        # If a guest with the same email and mobile exists, use their established name
        guest_name_to_use = existing_booking.guest_name

    # Check if rooms are available for the requested dates
    for room_id in booking.room_ids:
        # Check if room is already booked for overlapping dates (only check active bookings, not cancelled or checked-out)
        conflicting_booking = db.query(BookingRoom).join(Booking).filter(
            BookingRoom.room_id == room_id,
            Booking.status.in_(['booked', 'checked-in']),  # Only check for active bookings
            Booking.check_in < booking.check_out,
            Booking.check_out > booking.check_in
        ).first()
        
        if conflicting_booking:
            room = db.query(Room).filter(Room.id == room_id).first()
            raise HTTPException(
                status_code=400,
                detail=f"Room {room.number if room else room_id} is not available for the selected dates."
            )

    db_booking = Booking(
        guest_name=guest_name_to_use,
        guest_mobile=booking.guest_mobile,
        guest_email=booking.guest_email,
        check_in=booking.check_in,
        check_out=booking.check_out,
        adults=booking.adults,
        children=booking.children,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Create BookingRoom links and update room status
    for room_id in booking.room_ids:
        room = db.query(Room).filter(Room.id == room_id).first()
        if room:
            room.status = "Booked"
        db.add(BookingRoom(booking_id=db_booking.id, room_id=room_id))
    
    db.commit()

    db.refresh(db_booking)
    
    # Reload with room details for response
    booking_with_rooms = (
        db.query(Booking)
        .options(joinedload(Booking.booking_rooms).joinedload(BookingRoom.room))
        .filter(Booking.id == db_booking.id)
        .first()
    )
    
    # Convert to BookingOut format with rooms
    booking_out = BookingOut(
        id=booking_with_rooms.id,
        guest_name=booking_with_rooms.guest_name,
        guest_mobile=booking_with_rooms.guest_mobile,
        guest_email=booking_with_rooms.guest_email,
        status=booking_with_rooms.status,
        check_in=booking_with_rooms.check_in,
        check_out=booking_with_rooms.check_out,
        adults=booking_with_rooms.adults,
        children=booking_with_rooms.children,
        id_card_image_url=getattr(booking_with_rooms, 'id_card_image_url', None),
        guest_photo_url=getattr(booking_with_rooms, 'guest_photo_url', None),
        user=booking_with_rooms.user,
        is_package=False,
        rooms=[br.room for br in booking_with_rooms.booking_rooms if br.room]
    )
    
    return booking_out

@router.post("/guest", response_model=BookingOut, summary="Create a booking as a guest")
def create_guest_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    """
    Public endpoint for guests to create a booking without authentication.
    """
    # Check for duplicate booking with same details and dates
    duplicate_booking = db.query(Booking).filter(
        (Booking.guest_email == booking.guest_email) & 
        (Booking.guest_mobile == booking.guest_mobile) &
        (Booking.check_in == booking.check_in) &
        (Booking.check_out == booking.check_out) &
        (Booking.status.in_(['booked', 'checked-in']))
    ).first()
    
    if duplicate_booking:
        raise HTTPException(
            status_code=400, 
            detail="A booking with the same details and dates already exists. Please check your existing bookings."
        )

    # Check for an existing booking to reuse guest details for consistency
    existing_booking = db.query(Booking).filter(
        (Booking.guest_email == booking.guest_email) & (Booking.guest_mobile == booking.guest_mobile)
    ).order_by(Booking.id.desc()).first()

    guest_name_to_use = booking.guest_name
    if existing_booking:
        # If a guest with the same email and mobile exists, use their established name
        guest_name_to_use = existing_booking.guest_name

    # Check if rooms are available for the requested dates
    for room_id in booking.room_ids:
        # Check if room is already booked for overlapping dates
        conflicting_booking = db.query(BookingRoom).join(Booking).filter(
            BookingRoom.room_id == room_id,
            Booking.status.in_(['booked', 'checked-in']),
            Booking.check_in < booking.check_out,
            Booking.check_out > booking.check_in
        ).first()
        
        if conflicting_booking:
            room = db.query(Room).filter(Room.id == room_id).first()
            raise HTTPException(
                status_code=400,
                detail=f"Room {room.number if room else room_id} is not available for the selected dates."
            )

    db_booking = Booking(
        guest_name=guest_name_to_use,
        guest_mobile=booking.guest_mobile,
        guest_email=booking.guest_email,
        check_in=booking.check_in,
        check_out=booking.check_out,
        adults=booking.adults,
        children=booking.children,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Create BookingRoom links and update room status
    for room_id in booking.room_ids:
        db.query(Room).filter(Room.id == room_id).update({"status": "Booked"})
        db.add(BookingRoom(booking_id=db_booking.id, room_id=room_id))
    db.commit()
    db.refresh(db_booking)
    return db_booking

# -------------------------------
# Check-in a booking
# -------------------------------
@router.put("/{booking_id}/check-in", response_model=BookingOut)
def check_in_booking(
    booking_id: int,
    id_card_image: UploadFile = File(...),
    guest_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "booked":
        raise HTTPException(status_code=400, detail=f"Booking is not in 'booked' state. Current status: {booking.status}")

    # Save ID card image
    id_card_filename = f"id_{booking_id}_{uuid.uuid4().hex}.jpg"
    id_card_path = os.path.join(UPLOAD_DIR, id_card_filename)
    with open(id_card_path, "wb") as buffer:
        shutil.copyfileobj(id_card_image.file, buffer)
    booking.id_card_image_url = id_card_filename

    # Save guest photo
    guest_photo_filename = f"guest_{booking_id}_{uuid.uuid4().hex}.jpg"
    guest_photo_path = os.path.join(UPLOAD_DIR, guest_photo_filename)
    with open(guest_photo_path, "wb") as buffer:
        shutil.copyfileobj(guest_photo.file, buffer)
    booking.guest_photo_url = guest_photo_filename

    booking.status = "checked-in"

    # Save the ID of the user who performed the check-in
    booking.user_id = current_user.id

    # CRITICAL FIX: Update the status of the associated rooms to 'Checked-in'
    if booking.booking_rooms:
        room_ids = [br.room_id for br in booking.booking_rooms]
        db.query(Room).filter(Room.id.in_(room_ids)).update({"status": "Checked-in"}, synchronize_session=False)

    db.commit()
    db.refresh(booking)
    return booking

# -------------------------------
# Cancel a booking
# -------------------------------
@router.put("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Free up the rooms associated with the booking
    if booking.booking_rooms:
        room_ids = [br.room_id for br in booking.booking_rooms]
        db.query(Room).filter(Room.id.in_(room_ids)).update({"status": "Available"}, synchronize_session=False)

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking
    
@router.put("/{booking_id}/extend", response_model=BookingOut)
def extend_checkout(booking_id: int, new_checkout: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if new_checkout <= str(booking.check_out):
        raise HTTPException(status_code=400, detail="New checkout must be after current checkout")

    booking.check_out = new_checkout
    db.commit()
    db.refresh(booking)

    return booking
# -------------------------------
# GET booking by ID
# -------------------------------
@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).options(
        joinedload(Booking.booking_rooms).joinedload(BookingRoom.room)
    ).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# -------------------------------
# GET check-in images
# -------------------------------
@router.get("/checkin-image/{filename}")
def get_checkin_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath) or not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)