from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import date
from app.models.service import Service, AssignedService, ServiceImage
from app.models.booking import Booking, BookingRoom
from app.models.Package import PackageBooking, PackageBookingRoom
from app.schemas.service import ServiceCreate, AssignedServiceCreate, AssignedServiceUpdate

def create_service(db: Session, name: str, description: str, charges: float, image_urls: List[str] = None):
    db_service = Service(name=name, description=description, charges=charges)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    
    if image_urls:
        for url in image_urls:
            img = ServiceImage(service_id=db_service.id, image_url=url)
            db.add(img)
        db.commit()
        db.refresh(db_service)
    
    # Load images relationship
    return db.query(Service).options(joinedload(Service.images)).filter(Service.id == db_service.id).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Service).options(joinedload(Service.images)).offset(skip).limit(limit).all()

def delete_service(db: Session, service_id: int):
    service = db.query(Service).filter(Service.id == service_id).first()
    if service:
        db.delete(service)
        db.commit()
        return True
    return False

def create_assigned_service(db: Session, assigned: AssignedServiceCreate):
    db_assigned = AssignedService(**assigned.dict())
    db.add(db_assigned)
    db.commit()
    db.refresh(db_assigned)
    return db_assigned

def get_assigned_services(db: Session, skip: int = 0, limit: int = 100):
    """
    Get assigned services, but only for rooms that have checked-in bookings.
    This ensures only active (checked-in) rooms are shown in the assigned services table.
    """
    today = date.today()
    
    # Find all room IDs that have checked-in bookings (regular or package)
    checked_in_room_ids = set()
    
    # Get rooms with checked-in regular bookings
    regular_checked_in = db.query(BookingRoom.room_id).join(Booking).filter(
        Booking.status.in_(['checked-in', 'checked_in']),
        Booking.check_in <= today,
        Booking.check_out > today
    ).all()
    checked_in_room_ids.update([r.room_id for r in regular_checked_in if r.room_id])
    
    # Get rooms with checked-in package bookings
    package_checked_in = db.query(PackageBookingRoom.room_id).join(PackageBooking).filter(
        PackageBooking.status.in_(['checked-in', 'checked_in']),
        PackageBooking.check_in <= today,
        PackageBooking.check_out > today
    ).all()
    checked_in_room_ids.update([r.room_id for r in package_checked_in if r.room_id])
    
    # Only return assigned services for checked-in rooms
    if not checked_in_room_ids:
        return []
    
    return db.query(AssignedService).filter(
        AssignedService.room_id.in_(list(checked_in_room_ids))
    ).options(
        joinedload(AssignedService.service),
        joinedload(AssignedService.employee),
        joinedload(AssignedService.room)
    ).offset(skip).limit(limit).all()

def update_assigned_service_status(db: Session, assigned_id: int, update_data: AssignedServiceUpdate):
    assigned = db.query(AssignedService).filter(AssignedService.id == assigned_id).first()
    if assigned:
        assigned.status = update_data.status
        db.commit()
        db.refresh(assigned)
        return assigned
    return None

def delete_assigned_service(db: Session, assigned_id: int):
    assigned = db.query(AssignedService).filter(AssignedService.id == assigned_id).first()
    if assigned:
        db.delete(assigned)
        db.commit()
        return True
    return False
