from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from fastapi import HTTPException
from typing import List

from app.models.Package import Package, PackageImage, PackageBooking, PackageBookingRoom
from app.models.room import Room
from app.schemas.packages import PackageBookingCreate


# ------------------- Packages -------------------

def create_package(db: Session, title: str, description: str, price: float, image_urls: List[str]):
    pkg = Package(title=title, description=description, price=price)
    db.add(pkg)
    db.commit()
    db.refresh(pkg)

    for url in image_urls:
        img = PackageImage(package_id=pkg.id, image_url=url)
        db.add(img)
    db.commit()
    db.refresh(pkg)
    return pkg





def delete_package(db: Session, package_id: int):
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        return False
    db.delete(pkg)
    db.commit()
    return True


# ------------------- Package Bookings -------------------
def get_package_bookings(db: Session):
    return (
        db.query(PackageBooking)
        .join(PackageBooking.package)  # Use an inner join to filter out bookings with no package
        .options(joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room))
    ).all()

def book_package(db: Session, booking: PackageBookingCreate):
    # Check for an existing package booking to reuse guest details for consistency
    existing_booking = db.query(PackageBooking).filter(
        (PackageBooking.guest_email == booking.guest_email) & (PackageBooking.guest_mobile == booking.guest_mobile)
    ).order_by(PackageBooking.id.desc()).first()

    guest_name_to_use = booking.guest_name
    if existing_booking:
        # If a guest with the same email and mobile exists, use their established name
        guest_name_to_use = existing_booking.guest_name

    db_booking = PackageBooking(
        package_id=booking.package_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guest_name=guest_name_to_use,
        guest_email=booking.guest_email,
        guest_mobile=booking.guest_mobile,
        adults=booking.adults,
        children=booking.children,
        status="booked"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Assign multiple rooms
    for room_id in booking.room_ids:
        conflict = (
            db.query(PackageBookingRoom)
            .join(PackageBooking)
            .filter(
                PackageBookingRoom.room_id == room_id,
                PackageBooking.status == "booked",
                or_(
                    and_(
                        PackageBooking.check_in <= booking.check_in,
                        PackageBooking.check_out > booking.check_in
                    ),
                    and_(
                        PackageBooking.check_in < booking.check_out,
                        PackageBooking.check_out >= booking.check_out
                    ),
                    and_(
                        PackageBooking.check_in >= booking.check_in,
                        PackageBooking.check_out <= booking.check_out
                    ),
                )
            )
            .first()
        )

        if conflict:
            raise HTTPException(status_code=400, detail=f"Room {room_id} is not available")
        
        # --- FIX: Update the room's status to 'Booked' ---
        room_to_update = db.query(Room).filter(Room.id == room_id).first()
        if room_to_update:
            room_to_update.status = "Booked"
        # ----------------------------------------------------

        db_room_link = PackageBookingRoom(package_booking_id=db_booking.id, room_id=room_id)
        db.add(db_room_link)

    db.commit()

    # Reload with rooms + room details
    booking_with_rooms = (
        db.query(PackageBooking)
        .options(joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room))
        .filter(PackageBooking.id == db_booking.id)
        .first()
    )
    return booking_with_rooms





def delete_package_booking(db: Session, booking_id: int):
    booking = db.query(PackageBooking).filter(PackageBooking.id == booking_id).first()
    if not booking:
        return False

    booking.status = "cancelled"

    for link in booking.rooms:
        room_to_update = db.query(Room).filter(Room.id == link.room_id).first()
        if room_to_update:
            room_to_update.status = "Available"

    db.commit()
    db.refresh(booking)
    return True
def get_packages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Package).offset(skip).limit(limit).all()


def get_package(db: Session, package_id: int):
    return db.query(Package).filter(Package.id == package_id).first()