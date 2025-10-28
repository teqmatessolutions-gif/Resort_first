from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
import os
from app.models.user import User
from app.models.room import Room
from app.models.Package import Package, PackageBooking, PackageBookingRoom
from app.utils.auth import get_db, get_current_user
from app.schemas.packages import PackageBookingCreate, PackageOut, PackageBookingOut
from fastapi.responses import FileResponse
from app.curd import packages as crud_package
import shutil
import uuid

router = APIRouter(prefix="/packages", tags=["Packages"])

UPLOAD_DIR = "uploads/packages"
CHECKIN_UPLOAD_DIR = "uploads/checkin_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHECKIN_UPLOAD_DIR, exist_ok=True)


# ------------------- Packages -------------------

@router.post("/", response_model=PackageOut)
async def create_package_api(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_urls = []
    for img in images:
        # Generate unique filename
        filename = f"pkg_{uuid.uuid4().hex}_{img.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(img.file, buffer)
        # Store with leading slash for proper URL construction
        image_urls.append(f"/{file_path.replace('\\', '/')}")

    return crud_package.create_package(db, title, description, price, image_urls)





@router.delete("/{package_id}")
def delete_package_api(package_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud_package.delete_package(db, package_id)
    return {"deleted": success}


# ------------------- Package Bookings -------------------

@router.post("/book", response_model=PackageBookingOut)
def book_package_api(
    booking: PackageBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = crud_package.book_package(db, booking)
    
    # Send confirmation email if email address is provided
    if booking.guest_email and result:
        try:
            from app.utils.email import send_email, create_booking_confirmation_email
            
            # Get package details
            package = db.query(Package).filter(Package.id == booking.package_id).first()
            
            # Get room details
            rooms_data = [
                {
                    'number': pbr.room.number if pbr.room else 'N/A',
                    'type': pbr.room.type if pbr.room else 'N/A'
                }
                for pbr in result.rooms if pbr.room
            ]
            
            email_html = create_booking_confirmation_email(
                guest_name=result.guest_name,
                booking_id=result.id,
                booking_type='package',
                check_in=str(result.check_in),
                check_out=str(result.check_out),
                rooms=rooms_data,
                package_name=package.title if package else None
            )
            
            send_email(
                to_email=booking.guest_email,
                subject=f"Package Booking Confirmation #{result.id} - Elysian Retreat",
                html_content=email_html,
                to_name=result.guest_name
            )
        except Exception as e:
            # Log error but don't fail the booking
            print(f"Failed to send confirmation email: {str(e)}")
    
    return result

@router.post("/book/guest", response_model=PackageBookingOut, summary="Book a package as a guest")
def book_package_guest_api(
    booking: PackageBookingCreate,
    db: Session = Depends(get_db)
):
    """
    Public endpoint for guests to book a package without authentication.
    """
    result = crud_package.book_package(db, booking)
    
    # Send confirmation email if email address is provided
    if booking.guest_email and result:
        try:
            from app.utils.email import send_email, create_booking_confirmation_email
            
            # Get package details
            package = db.query(Package).filter(Package.id == booking.package_id).first()
            
            # Get room details
            rooms_data = [
                {
                    'number': pbr.room.number if pbr.room else 'N/A',
                    'type': pbr.room.type if pbr.room else 'N/A'
                }
                for pbr in result.rooms if pbr.room
            ]
            
            email_html = create_booking_confirmation_email(
                guest_name=result.guest_name,
                booking_id=result.id,
                booking_type='package',
                check_in=str(result.check_in),
                check_out=str(result.check_out),
                rooms=rooms_data,
                package_name=package.title if package else None
            )
            
            send_email(
                to_email=booking.guest_email,
                subject=f"Package Booking Confirmation #{result.id} - Elysian Retreat",
                html_content=email_html,
                to_name=result.guest_name
            )
        except Exception as e:
            # Log error but don't fail the booking
            print(f"Failed to send confirmation email: {str(e)}")
    
    return result

@router.get("/bookingsall", response_model=List[PackageBookingOut])
def get_bookings(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    # It's possible for a package to be deleted, leaving an orphaned booking.
    # We must filter to only include bookings that still have a valid package_id.
    # We also need to eagerly load the related package and room data for the frontend.
    return db.query(PackageBooking).options(
        joinedload(PackageBooking.package),
        joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room)
    ).filter(PackageBooking.package_id.is_not(None)).offset(skip).limit(limit).all()


@router.get("/", response_model=List[PackageOut])
def list_packages(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    # Query directly in the endpoint to apply pagination
    return db.query(Package).offset(skip).limit(limit).all()


@router.get("/{package_id}", response_model=PackageOut)
def get_package_api(package_id: int, db: Session = Depends(get_db)):
    return crud_package.get_package(db, package_id)


@router.delete("/booking/{booking_id}")
def delete_package_booking_api(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud_package.delete_package_booking(db, booking_id)
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"deleted": success}

@router.put("/booking/{booking_id}/check-in", response_model=PackageBookingOut)
def check_in_package_booking(
    booking_id: int,
    id_card_image: UploadFile = File(...),
    guest_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = (
        db.query(PackageBooking)
        .options(joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room))
        .filter(PackageBooking.id == booking_id).first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Package booking not found")
    if booking.status != "booked":
        raise HTTPException(status_code=400, detail=f"Booking is not in 'booked' state. Current status: {booking.status}")

    # Save ID card image
    id_card_filename = f"id_pkg_{booking_id}_{uuid.uuid4().hex}.jpg"
    id_card_path = os.path.join(CHECKIN_UPLOAD_DIR, id_card_filename)
    with open(id_card_path, "wb") as buffer:
        shutil.copyfileobj(id_card_image.file, buffer)
    booking.id_card_image_url = id_card_filename

    # Save guest photo
    guest_photo_filename = f"guest_pkg_{booking_id}_{uuid.uuid4().hex}.jpg"
    guest_photo_path = os.path.join(CHECKIN_UPLOAD_DIR, guest_photo_filename)
    with open(guest_photo_path, "wb") as buffer:
        shutil.copyfileobj(guest_photo.file, buffer)
    booking.guest_photo_url = guest_photo_filename

    booking.status = "checked-in"
    booking.user_id = current_user.id

    if booking.rooms:
        room_ids = [br.room_id for br in booking.rooms]
        db.query(Room).filter(Room.id.in_(room_ids)).update({"status": "Checked-in"}, synchronize_session=False)

    db.commit()
    db.refresh(booking)
    return booking

# -------------------------------
# GET check-in images for packages
# -------------------------------
@router.get("/booking/checkin-image/{filename}")
def get_package_checkin_image(filename: str):
    filepath = os.path.join(CHECKIN_UPLOAD_DIR, filename)
    if not os.path.exists(filepath) or not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
