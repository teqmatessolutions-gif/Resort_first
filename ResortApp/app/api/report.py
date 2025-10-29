# app/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime
from app.utils.auth import get_db
from app import models as models
from app.schemas import booking as booking_schema, packages as package_schema, suggestion as suggestion_schema
from app.schemas.foodorder import FoodOrderItemOut
from pydantic import BaseModel, Field

router = APIRouter(prefix="/reports", tags=["Reports"])

class CheckinByEmployeeOut(BaseModel):
    employee_name: str
    checkin_count: int

class GuestBookingHistory(BaseModel):
    id: int
    type: str
    check_in: date
    check_out: date
    status: str
    rooms: List[str]
    id_card_image_url: Optional[str] = None
    guest_photo_url: Optional[str] = None

class GuestFoodOrderHistory(BaseModel):
    id: int
    room_number: Optional[str]
    amount: float
    status: str
    created_at: datetime
    items: List[FoodOrderItemOut]

class GuestServiceHistory(BaseModel):
    id: int
    service_name: Optional[str]
    room_number: Optional[str]
    charges: Optional[float]
    status: str
    assigned_at: datetime

class GuestProfileOut(BaseModel):
    guest_details: Dict[str, str]
    bookings: List[GuestBookingHistory]
    food_orders: List[GuestFoodOrderHistory]
    services: List[GuestServiceHistory]

    class Config:
        from_attributes = True

class UserActivityItem(BaseModel):
    type: str
    activity_date: datetime
    description: str
    amount: Optional[float] = None
    status: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)

class UserHistoryOut(BaseModel):
    user_name: str
    activities: List[UserActivityItem]



@router.get("/guest-profile", response_model=GuestProfileOut)
def get_guest_profile(
    guest_email: Optional[str] = Query(None, description="Guest's email address"),
    guest_mobile: Optional[str] = Query(None, description="Guest's mobile number"),
    guest_name: Optional[str] = Query(None, description="Guest's name (case-insensitive search)"),
    db: Session = Depends(get_db)
):
    """Generates a complete profile for a guest, including all bookings, orders, and services."""
    if not guest_email and not guest_mobile and not guest_name:
        raise HTTPException(status_code=400, detail="Please provide an email, mobile, or name to search.")
    return _get_guest_profile_data(db, guest_email, guest_mobile, guest_name)

@router.get("/food-orders")
def get_food_orders(
    from_date: Optional[date] = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = (
        db.query(models.FoodOrder)
        .options(
            joinedload(models.FoodOrder.employee),
            # Eagerly load booking through room to get guest name
            joinedload(models.FoodOrder.room)
        )
    )

    if from_date:
        query = query.filter(models.foodorder.FoodOrder.created_at >= from_date)
    if to_date:
        query = query.filter(models.foodorder.FoodOrder.created_at <= to_date)

    orders = query.order_by(models.FoodOrder.created_at.desc()).offset(skip).limit(limit).all()
    # Fetch all rooms in one go
    room_map = {r.id: r for r in db.query(models.Room).all()}

    def get_guest_for_room(room_id, db_session):
        if not room_id:
            return None
        # Find the most recent active booking associated with this room (check both regular and package bookings)
        # Check regular bookings first
        active_booking = (
            db_session.query(models.Booking)
            .join(models.booking.BookingRoom)
            .filter(models.booking.BookingRoom.room_id == room_id)
            .filter(models.Booking.status.in_(["checked-in", "booked"]))
            .order_by(models.Booking.id.desc())
            .first()
        )
        
        if active_booking:
            return active_booking.guest_name
        
        # Check package bookings if no regular booking found
        active_package_booking = (
            db_session.query(models.PackageBooking)
            .join(models.PackageBookingRoom)
            .filter(models.PackageBookingRoom.room_id == room_id)
            .filter(models.PackageBooking.status.in_(["checked-in", "booked"]))
            .order_by(models.PackageBooking.id.desc())
            .first()
        )
        
        if active_package_booking:
            return active_package_booking.guest_name
        
        return None

    return [
        {
            "id": o.id,
            "room_number": room_map.get(o.room_id).number if room_map.get(o.room_id) else None,
            "employee_name": o.employee.name if o.employee else None,
            # Add guest name to the response
            "guest_name": get_guest_for_room(o.room_id, db),
            "amount": o.amount,
            "status": o.status,
            "item_count": len(o.items),
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]


@router.get("/user-history", response_model=UserHistoryOut)
def get_user_history(
    user_id: int,
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Generates a complete history of activities for a specific user within a date range.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    activities = []

    # Helper to apply date filter
    def apply_date_filter(query, date_column):
        if from_date:
            query = query.filter(date_column >= from_date)
        if to_date:
            # Add one day to to_date to make it inclusive
            query = query.filter(date_column < to_date + timedelta(days=1))
        return query

    # 1. Room Bookings created by user
    room_bookings_query = db.query(models.Booking).filter(models.Booking.user_id == user_id)
    room_bookings = apply_date_filter(room_bookings_query, models.Booking.check_in).options(
        joinedload(models.Booking.booking_rooms).joinedload(models.booking.BookingRoom.room)
    ).all()
    for b in room_bookings:
        stay_days = max(1, (b.check_out - b.check_in).days)
        room_total = sum(br.room.price for br in b.booking_rooms if br.room) * stay_days
        activities.append(UserActivityItem(
            type="Room Booking", activity_date=datetime.combine(b.check_in, datetime.min.time()), 
            description=f"Created booking for {b.guest_name}", amount=room_total, status=b.status,
            details={"guest_name": b.guest_name, "check_in": b.check_in, "check_out": b.check_out}
        ))

    # 2. Package Bookings created by user
    package_bookings_query = db.query(models.PackageBooking).filter(models.PackageBooking.user_id == user_id) 
    package_bookings = apply_date_filter(package_bookings_query, models.PackageBooking.check_in).all()
    for pb in package_bookings:
        activities.append(UserActivityItem(
            type="Package Booking", activity_date=datetime.combine(pb.check_in, datetime.min.time()),
            description=f"Created package booking for {pb.guest_name}", amount=pb.package.price if pb.package else 0, status=pb.status,
            details={"guest_name": pb.guest_name, "package_title": pb.package.title if pb.package else "N/A"}
        ))

    # 3. Food Orders assigned to user
    food_orders_query = db.query(models.FoodOrder).filter(models.FoodOrder.assigned_employee_id == user_id)
    food_orders = apply_date_filter(food_orders_query, models.FoodOrder.created_at).all()
    food_orders_query = food_orders_query.options(joinedload(models.FoodOrder.room))
    for fo in food_orders:
        activities.append(UserActivityItem(
            type="Food Order", activity_date=fo.created_at,
            description=f"Handled food order for Room {fo.room.number if fo.room else 'N/A'}", amount=fo.amount, status=fo.status,
            details={"room_number": fo.room.number if fo.room else "N/A", "items": len(fo.items)}
        ))

    # 4. Services assigned to user
    services_query = db.query(models.AssignedService).filter(models.AssignedService.employee_id == user_id)
    assigned_services = apply_date_filter(services_query, models.AssignedService.assigned_at).all()
    for s in assigned_services:
        activities.append(UserActivityItem(
            type="Service", activity_date=s.assigned_at,
            description=f"Assigned service '{s.service.name if s.service else 'N/A'}' to Room {s.room.number if s.room else 'N/A'}", amount=s.service.charges if s.service else 0, status=s.status,
            details={"service_name": s.service.name if s.service else "N/A", "room_number": s.room.number if s.room else "N/A"}
        ))

    # 5. Expenses submitted by user
    expenses_query = db.query(models.Expense).filter(models.Expense.employee_id == user_id)
    expenses = apply_date_filter(expenses_query, models.expense.Expense.date).all()
    for e in expenses:
        activities.append(UserActivityItem(
            type="Expense", activity_date=e.date,
            description=f"Submitted expense: {e.description}", amount=e.amount, status=e.category,
            details={"category": e.category}
        ))

    # Sort all activities by date, descending
    sorted_activities = sorted(activities, key=lambda x: x.activity_date, reverse=True)

    return UserHistoryOut(user_name=user.name, activities=sorted_activities)

@router.get("/service-charges")
def get_service_charges(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = (
        db.query(models.AssignedService)
        .options(
            joinedload(models.AssignedService.room),
            joinedload(models.AssignedService.employee),
            joinedload(models.AssignedService.service),
        )
    )

    if from_date:
        query = query.filter(models.AssignedService.assigned_at >= from_date)
    if to_date:
        query = query.filter(models.AssignedService.assigned_at <= to_date)

    assigned_services = query.order_by(models.AssignedService.assigned_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": s.id,
            "room_number": s.room.number if s.room else None,
            "employee_name": s.employee.name if s.employee else None,
            "amount": s.service.charges if s.service else None,
            "status": s.status,
            "service_name": s.service.name if s.service else None,
            "created_at": s.assigned_at.isoformat() if s.assigned_at else None,
        }
        for s in assigned_services
    ]


@router.get("/room-charges")
def get_room_charges(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = (
        db.query(models.Checkout)
        .options(joinedload(models.Checkout.booking).joinedload(models.Booking.booking_rooms).joinedload(models.booking.BookingRoom.room))
    )

    if from_date:
        query = query.filter(models.Checkout.checkout_date >= from_date)
    if to_date:
        # Add one day to to_date to include all records on that day
        query = query.filter(models.Checkout.checkout_date < to_date + timedelta(days=1))

    checkouts = query.order_by(models.Checkout.checkout_date.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": c.id,
            "room_number": c.room_number,
            "description": "Room booking charge",
            "amount": c.room_total,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in checkouts
    ]


@router.get("/rent-records")
def get_rent_records(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    if not hasattr(models, "Rent"):
        raise HTTPException(status_code=404, detail="Rent model not found")

    query = (
        db.query(models.Rent)
        .options(joinedload(models.Rent.room))
    )

    if from_date:
        query = query.filter(models.Rent.paid_date >= from_date)
    if to_date:
        query = query.filter(models.Rent.paid_date <= to_date)

    rents = query.order_by(models.Rent.paid_date.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "tenant_name": r.tenant_name,
            "room_number": r.room.number if r.room else None,
            "amount": r.amount,
            "paid_date": r.paid_date.isoformat() if r.paid_date else None,
        }
        for r in rents
    ]

@router.get("/expenses")
def get_all_expenses(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of all expenses."""
    query = db.query(models.Expense)
    
    if from_date:
        query = query.filter(models.Expense.date >= from_date)
    if to_date:
        query = query.filter(models.Expense.date <= to_date)
        
    expenses = query.order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": e.id,
            "category": e.category,
            "description": e.description,
            "amount": e.amount,
            "expense_date": e.date.isoformat() if e.date else None,
        }
        for e in expenses
    ]

@router.get("/room-bookings", response_model=List[booking_schema.BookingOut])
def get_all_room_bookings(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of all standard room bookings."""
    query = db.query(models.Booking)
    if from_date:
        query = query.filter(models.Booking.check_in >= from_date)
    if to_date:
        # Filter bookings that start before or on the to_date
        query = query.filter(models.Booking.check_in <= to_date)
    
    bookings = query.order_by(models.Booking.id.desc()).offset(skip).limit(limit).all()
    
    # Manually construct the response to include calculated total_amount
    response = []
    for b in bookings:
        stay_days = max(1, (b.check_out - b.check_in).days)
        room_total = sum(r.room.price for r in b.booking_rooms if r.room) * stay_days
        
        booking_out = booking_schema.BookingOut.model_validate(b)
        # The schema might have total_amount, but we'll override it with our calculation
        booking_dict = booking_out.model_dump()
        booking_dict['total_amount'] = room_total
        response.append(booking_dict)
        
    return response

@router.get("/package-bookings", response_model=List[package_schema.PackageBookingOut])
def get_all_package_bookings(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of all package bookings."""
    # Use an inner join to filter out orphaned bookings where the package has been deleted.
    # This prevents validation errors when the response model expects a valid package_id.
    query = db.query(models.PackageBooking).join(models.PackageBooking.package)

    if from_date:
        query = query.filter(models.PackageBooking.check_in >= from_date)
    if to_date:
        query = query.filter(models.PackageBooking.check_in <= to_date)
    return query.order_by(models.PackageBooking.id.desc()).offset(skip).limit(limit).all()

@router.get("/employees")
def get_all_employees(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Retrieves a list of all active employees and their salaries."""
    # The Employee model itself doesn't have an 'is_active' flag. We assume all listed employees are active.
    query = db.query(models.Employee)
    if from_date:
        query = query.filter(models.Employee.join_date >= from_date)
    if to_date:
        query = query.filter(models.Employee.join_date <= to_date)
    employees = query.order_by(models.Employee.name).offset(skip).limit(limit).all()
    return [
        {
            "id": emp.id,
            "name": emp.name,
            "role": emp.role,
            "salary": emp.salary,
            "hire_date": emp.join_date.isoformat() if emp.join_date else None,
        }
        for emp in employees
    ]

@router.get("/checkin-by-employee", response_model=List[CheckinByEmployeeOut])
def get_checkin_by_employee_report(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Generates a report of how many check-ins each employee has performed.
    This includes both regular and package bookings.
    """
    # Query for regular bookings
    regular_checkins = (
        db.query(models.User.name, func.count(models.Booking.id))
        .join(models.User, models.Booking.user_id == models.User.id)
        .filter(models.Booking.status.in_(["checked-in", "checked_out"]))
    )
    # Query for package bookings
    package_checkins = (
        db.query(models.User.name, func.count(models.PackageBooking.id))
        .join(models.User, models.PackageBooking.user_id == models.User.id)
        .filter(models.PackageBooking.status.in_(["checked-in", "checked_out"]))
    )

    # This example will only count regular bookings for simplicity.
    # A more advanced implementation would union these two queries.
    if from_date: regular_checkins = regular_checkins.filter(models.Booking.check_in >= from_date)
    if to_date: regular_checkins = regular_checkins.filter(models.Booking.check_in <= to_date)

    results = regular_checkins.group_by(models.User.name).order_by(func.count(models.Booking.id).desc()).all()
    return [{"employee_name": name, "checkin_count": count} for name, count in results]


class GuestSuggestion(BaseModel):
    guest_name: str
    guest_email: Optional[str] = None
    guest_mobile: Optional[str] = None

@router.get("/guest-suggestions", response_model=List[GuestSuggestion])
def get_guest_suggestions(
    db: Session = Depends(get_db),
    limit: int = 20
):
    """
    Retrieves a list of recent, unique guests for quick search suggestions.
    It fetches from both regular and package bookings.
    """
    # Get recent guests from regular bookings
    regular_guests_query = (
        db.query(models.Booking.guest_name, models.Booking.guest_email, models.Booking.guest_mobile)
        .distinct(models.Booking.guest_email, models.Booking.guest_mobile)
        .order_by(models.Booking.guest_email, models.Booking.guest_mobile, models.Booking.id.desc())
        .limit(limit)
    )

    # Get recent guests from package bookings
    package_guests_query = (
        db.query(models.PackageBooking.guest_name, models.PackageBooking.guest_email, models.PackageBooking.guest_mobile)
        .distinct(models.PackageBooking.guest_email, models.PackageBooking.guest_mobile)
        .order_by(models.PackageBooking.guest_email, models.PackageBooking.guest_mobile, models.PackageBooking.id.desc())
        .limit(limit)
    )

    # Combine and deduplicate results
    all_guests = {}
    for name, email, mobile in regular_guests_query.all() + package_guests_query.all():
        key = (email or "", mobile or "")
        if key not in all_guests and (email or mobile): # Ensure we have a unique identifier
            all_guests[key] = GuestSuggestion(guest_name=name, guest_email=email, guest_mobile=mobile)

    # Return a limited number of unique guests
    return list(all_guests.values())[:limit]

def _get_guest_profile_data(db: Session, email: Optional[str], mobile: Optional[str], name: Optional[str]):
    # Build dynamic filters
    filters = []
    if email:
        filters.append(models.Booking.guest_email == email)
    if mobile:
        filters.append(models.Booking.guest_mobile == mobile)
    if name:
        filters.append(models.Booking.guest_name.ilike(f"%{name}%"))

    pkg_filters = []
    if email:
        pkg_filters.append(models.PackageBooking.guest_email == email)
    if mobile:
        pkg_filters.append(models.PackageBooking.guest_mobile == mobile)
    if name:
        pkg_filters.append(models.PackageBooking.guest_name.ilike(f"%{name}%"))

    # 1. Find the guest's name from the most recent booking
    latest_booking = db.query(models.Booking).filter(*filters).order_by(models.Booking.id.desc()).first()
    latest_pkg_booking = db.query(models.PackageBooking).filter(*pkg_filters).order_by(models.PackageBooking.id.desc()).first()

    guest_name = name or "Unknown"
    guest_email = email
    guest_mobile = mobile

    if latest_booking and latest_pkg_booking:
        guest_name = latest_booking.guest_name if latest_booking.id > latest_pkg_booking.id else latest_pkg_booking.guest_name
        guest_email = latest_booking.guest_email if latest_booking.id > latest_pkg_booking.id else latest_pkg_booking.guest_email
        guest_mobile = latest_booking.guest_mobile if latest_booking.id > latest_pkg_booking.id else latest_pkg_booking.guest_mobile
    elif latest_booking:
        guest_name = latest_booking.guest_name
        guest_email = latest_booking.guest_email
        guest_mobile = latest_booking.guest_mobile
    elif latest_pkg_booking:
        guest_name = latest_pkg_booking.guest_name
        guest_email = latest_pkg_booking.guest_email
        guest_mobile = latest_pkg_booking.guest_mobile
    else:
        raise HTTPException(status_code=404, detail="No guest found with the provided details.")

    # Re-build filters with the exact guest details to fetch all their history
    filters = []
    if guest_email:
        filters.append(models.Booking.guest_email == guest_email)
    if guest_mobile:
        filters.append(models.Booking.guest_mobile == guest_mobile)

    pkg_filters = []
    if guest_email:
        pkg_filters.append(models.PackageBooking.guest_email == guest_email)
    if guest_mobile:
        pkg_filters.append(models.PackageBooking.guest_mobile == guest_mobile)


    # 2. Fetch all bookings (regular and package) for the guest
    regular_bookings = db.query(models.Booking).options(
        joinedload(models.Booking.booking_rooms).joinedload(models.booking.BookingRoom.room)
    ).filter(*filters).all()

    package_bookings = db.query(models.PackageBooking).options(
        joinedload(models.PackageBooking.rooms).joinedload(models.PackageBookingRoom.room)
    ).filter(*pkg_filters).all()

    # 3. Consolidate booking history and collect all room IDs
    booking_history = []
    all_room_ids = set()

    for b in regular_bookings:
        room_numbers = [br.room.number for br in b.booking_rooms if br.room]
        booking_history.append(GuestBookingHistory(
            id=b.id, type="Regular", check_in=b.check_in, check_out=b.check_out, status=b.status,
            rooms=room_numbers, id_card_image_url=b.id_card_image_url, guest_photo_url=b.guest_photo_url
        ))
        all_room_ids.update([br.room_id for br in b.booking_rooms])

    for pb in package_bookings:
        room_numbers = [pbr.room.number for pbr in pb.rooms if pbr.room]
        booking_history.append(GuestBookingHistory(
            id=pb.id, type="Package", check_in=pb.check_in, check_out=pb.check_out, status=pb.status,
            rooms=room_numbers, id_card_image_url=pb.id_card_image_url, guest_photo_url=pb.guest_photo_url
        ))
        all_room_ids.update([pbr.room_id for pbr in pb.rooms])

    # 4. Fetch all food orders and services associated with the guest's rooms
    food_orders_history = []
    if all_room_ids:
        food_orders = db.query(models.FoodOrder).options(
            joinedload(models.FoodOrder.items).joinedload(models.FoodOrderItem.food_item),
        ).filter(models.FoodOrder.room_id.in_(all_room_ids)).all()
        
        room_map = {r.id: r.number for r in db.query(models.Room).filter(models.Room.id.in_(all_room_ids)).all()}

        for order in food_orders:
            food_orders_history.append(GuestFoodOrderHistory(
                id=order.id,
                room_number=room_map.get(order.room_id),
                amount=order.amount,
                status=order.status,
                created_at=order.created_at,
                items=[item for item in order.items]
            ))

    services_history = []
    if all_room_ids:
        assigned_services = db.query(models.AssignedService).options(
            joinedload(models.AssignedService.service),
            joinedload(models.AssignedService.room)
        ).filter(models.AssignedService.room_id.in_(all_room_ids)).all()

        for service in assigned_services:
            services_history.append(GuestServiceHistory(
                id=service.id,
                service_name=service.service.name if service.service else None,
                room_number=service.room.number if service.room else None,
                charges=service.service.charges if service.service else 0,
                status=service.status,
                assigned_at=service.assigned_at
            ))

    # 5. Assemble the final profile
    return GuestProfileOut(
        guest_details={
            "name": guest_name,
            "email": guest_email,
            "mobile": guest_mobile
        },
        bookings=sorted(booking_history, key=lambda b: b.check_in, reverse=True),
        food_orders=sorted(food_orders_history, key=lambda o: o.created_at, reverse=True),
        services=sorted(services_history, key=lambda s: s.assigned_at, reverse=True)
    )
