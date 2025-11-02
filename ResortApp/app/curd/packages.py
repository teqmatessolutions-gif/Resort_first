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

def get_or_create_guest_user(db: Session, email: str, mobile: str, name: str):
    """
    Find or create a guest user based on email and mobile number.
    Returns the user_id to link bookings to the same user.
    """
    from app.models.user import User, Role
    import bcrypt
    
    # Normalize empty strings to None for easier handling
    email = email.strip() if email and isinstance(email, str) else None
    mobile = mobile.strip() if mobile and isinstance(mobile, str) else None
    name = name.strip() if name and isinstance(name, str) else "Guest User"
    
    # Need at least one identifier (email or mobile)
    if not email and not mobile:
        raise ValueError("Either email or mobile number must be provided")
    
    # First, try to find user by email (most reliable identifier)
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    
    # If not found by email, try by mobile/phone
    if not user and mobile:
        user = db.query(User).filter(User.phone == mobile).first()
    
    # If user exists, return the user_id
    if user:
        # Update name if provided and different
        if name and user.name != name:
            user.name = name
            db.commit()
        return user.id
    
    # If user doesn't exist, create a new guest user
    # First, ensure 'guest' role exists
    guest_role = db.query(Role).filter(Role.name == "guest").first()
    if not guest_role:
        # Create guest role if it doesn't exist
        guest_role = Role(name="guest", permissions="[]")
        db.add(guest_role)
        db.commit()
        db.refresh(guest_role)
    
    # Generate a placeholder password for guest users (they won't log in)
    password_bytes = "guest_user_no_password".encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt).decode("utf-8")
    
    # Create email if not provided (use mobile-based email or generate unique one)
    if not email:
        if mobile:
            user_email = f"guest_{mobile}@temp.com"
        else:
            # Generate a unique email based on timestamp
            import time
            user_email = f"guest_{int(time.time())}@temp.com"
    else:
        user_email = email
    
    # Create new guest user
    new_user = User(
        name=name,
        email=user_email,
        phone=mobile if mobile else None,
        hashed_password=hashed_password,
        role_id=guest_role.id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user.id

def book_package(db: Session, booking: PackageBookingCreate):
    # Find or create guest user based on email and mobile
    guest_user_id = None
    # Normalize email and mobile - convert empty strings to None
    guest_email = booking.guest_email.strip() if booking.guest_email and isinstance(booking.guest_email, str) else None
    guest_mobile = booking.guest_mobile.strip() if booking.guest_mobile and isinstance(booking.guest_mobile, str) else None
    
    if guest_email or guest_mobile:
        try:
            guest_user_id = get_or_create_guest_user(
                db=db,
                email=guest_email,
                mobile=guest_mobile,
                name=booking.guest_name or "Guest User"
            )
        except Exception as e:
            # Log error but don't fail the booking if user creation fails
            print(f"Warning: Could not create/link guest user: {str(e)}")
    
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
        status="booked",
        user_id=guest_user_id,  # Link booking to guest user
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
                PackageBooking.status.in_(["booked", "checked-in"]),  # Only check for active bookings
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
            room = db.query(Room).filter(Room.id == room_id).first()
            raise HTTPException(status_code=400, detail=f"Room {room.number if room else room_id} is not available for the selected dates.")
        
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