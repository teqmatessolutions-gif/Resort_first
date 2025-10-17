from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List

# Assume your utility and model imports are set up correctly
from app.utils.auth import get_db, get_current_user
from app.models.room import Room
from app.models.booking import Booking, BookingRoom
from app.models.Package import Package, PackageBooking, PackageBookingRoom
from app.models.user import User
from app.models.foodorder import FoodOrder, FoodOrderItem
from app.models.service import AssignedService, Service
from app.models.checkout import Checkout
from app.schemas.checkout import BillSummary, BillBreakdown, CheckoutFull, CheckoutSuccess, CheckoutRequest

router = APIRouter(prefix="/bill", tags=["checkout"])

# IMPORTANT: To support this new logic, you must update your BillSummary schema.
# In `app/schemas/checkout.py`, please change the `room_number: str` field to:
# room_numbers: List[str]


@router.get("/checkouts", response_model=List[CheckoutFull])
def get_all_checkouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 100):
    """Retrieves a list of all completed checkouts, ordered by most recent."""
    checkouts = db.query(Checkout).order_by(Checkout.id.desc()).offset(skip).limit(limit).all()
    return checkouts if checkouts else []

@router.get("/active-rooms", response_model=List[dict])
def get_active_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 100):
    """
    Returns a list of unique rooms that are part of an active, non-checked-out booking.
    Used to populate the checkout dropdown on the frontend.
    """
    # Fetch active bookings and package bookings with their rooms preloaded
    active_bookings = db.query(Booking).options(
        joinedload(Booking.booking_rooms).joinedload(BookingRoom.room)
    ).filter(Booking.status.in_(['checked-in', 'booked'])).all()
    
    active_package_bookings = db.query(PackageBooking).options(
        joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room)
    ).filter(PackageBooking.status.in_(['checked-in', 'booked'])).all()
    
    rooms = {}
    for booking in active_bookings:
        for link in booking.booking_rooms:
            if link.room and link.room.number not in rooms:
                rooms[link.room.number] = {"number": link.room.number, "guest_name": booking.guest_name}
    for pkg_booking in active_package_bookings:
        for link in pkg_booking.rooms:
            if link.room and link.room.number not in rooms:
                rooms[link.room.number] = {"number": link.room.number, "guest_name": pkg_booking.guest_name}
    
    return sorted(list(rooms.values()), key=lambda x: x['number'])[skip:skip+limit]

def _calculate_bill_for_entire_booking(db: Session, room_number: str):
    """
    Core logic: Finds an entire booking from a single room number and calculates the total bill
    for all associated rooms and services.
    """
    # 1. Find the initial room to identify the parent booking
    initial_room = db.query(Room).filter(Room.number == room_number).first()
    if not initial_room:
        raise HTTPException(status_code=404, detail="Initial room not found.")

    # 2. Find the active parent booking (regular or package) linked to this room
    booking, is_package = None, False
    
    # Eagerly load the booking relationship to avoid extra queries
    # Order by descending ID to get the MOST RECENT booking for the room first.
    booking_link = (db.query(BookingRoom)
                    .join(Booking)
                    .options(joinedload(BookingRoom.booking)) # Eager load the booking
                    .filter(BookingRoom.room_id == initial_room.id, Booking.status.in_(['checked-in', 'booked']))
                    .order_by(Booking.id.desc()).first())

    if booking_link:
        booking = booking_link.booking
    else:
        package_link = (db.query(PackageBookingRoom)
                        .join(PackageBooking)
                        .options(joinedload(PackageBookingRoom.package_booking)) # Eager load the booking
                        .filter(PackageBookingRoom.room_id == initial_room.id, PackageBooking.status.in_(['checked-in', 'booked']))
                        .order_by(PackageBooking.id.desc()).first())
        if package_link:
            booking = package_link.package_booking
            is_package = True

    if not booking:
        raise HTTPException(status_code=404, detail=f"No active booking found for room {room_number}.")

    # 3. Get ALL rooms and their IDs associated with the found booking
    all_rooms = []
    if is_package:
        # For package bookings, the relationship is `booking.rooms` -> `PackageBookingRoom` -> `room`
        all_rooms = [link.room for link in booking.rooms]
    else:
        # For regular bookings, the relationship is `booking.booking_rooms` -> `BookingRoom` -> `room`
        all_rooms = [link.room for link in booking.booking_rooms]
    
    room_ids = [room.id for room in all_rooms]
    
    if not all_rooms:
         raise HTTPException(status_code=404, detail="Booking found, but no rooms are linked to it.")

    # 4. Calculate total charges across ALL rooms
    charges = BillBreakdown()
    stay_days = max(1, (booking.check_out - booking.check_in).days)

    if is_package:
        # The package price is per room, per night.
        num_rooms_in_package = len(all_rooms)
        package_price_per_room = booking.package.price if booking.package else 0
        charges.package_charges = package_price_per_room * num_rooms_in_package * stay_days
        charges.room_charges = 0  # Room charges are included in the package price
    else:
        charges.package_charges = 0
        charges.room_charges = sum((room.price or 0) * stay_days for room in all_rooms)
    
    # Sum up additional food and service charges from all rooms
    # We need to get the individual items from the orders to display them.
    unbilled_food_order_items = (db.query(FoodOrderItem)
                                 .join(FoodOrder)
                                 .options(joinedload(FoodOrderItem.food_item))
                                 .filter(FoodOrder.room_id.in_(room_ids), FoodOrder.billing_status == "unbilled")
                                 .all())

    unbilled_services = db.query(AssignedService).options(joinedload(AssignedService.service)).filter(AssignedService.room_id.in_(room_ids), AssignedService.billing_status == "unbilled").all()

    # Calculate total food charges from the individual items.
    charges.food_charges = sum(item.quantity * item.food_item.price for item in unbilled_food_order_items if item.food_item)
    charges.service_charges = sum(ass.service.charges for ass in unbilled_services)

    # Populate detailed item lists for the bill summary
    charges.food_items = [{"item_name": item.food_item.name, "quantity": item.quantity, "amount": item.quantity * item.food_item.price} for item in unbilled_food_order_items if item.food_item]
    charges.service_items = [{"service_name": ass.service.name, "charges": ass.service.charges} for ass in unbilled_services]

    charges.total_due = sum([charges.room_charges, charges.food_charges, charges.service_charges, charges.package_charges])

    # Assume number_of_guests is a field on the booking model. Default to 1 if not present.
    number_of_guests = getattr(booking, 'number_of_guests', 1)

    return {
        "booking": booking, "all_rooms": all_rooms, "charges": charges, 
        "is_package": is_package, "stay_nights": stay_days, "number_of_guests": number_of_guests
    }


@router.get("/{room_number}", response_model=BillSummary)
def get_bill_for_booking(room_number: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a bill summary for the ENTIRE booking associated with the given room number.
    """
    bill_data = _calculate_bill_for_entire_booking(db, room_number)
    return BillSummary(
        guest_name=bill_data["booking"].guest_name,
        room_numbers=sorted([room.number for room in bill_data["all_rooms"]]),
        number_of_guests=bill_data["number_of_guests"],
        stay_nights=bill_data["stay_nights"],
        check_in=bill_data["booking"].check_in,
        check_out=bill_data["booking"].check_out,
        charges=bill_data["charges"]
    )


@router.post("/checkout/{room_number}", response_model=CheckoutSuccess)
def process_booking_checkout(room_number: str, request: CheckoutRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Finalizes the checkout for the ENTIRE booking associated with the given room number.
    This action is atomic and will update the booking and all associated rooms.
    """
    bill_data = _calculate_bill_for_entire_booking(db, room_number)

    booking = bill_data["booking"]

    # The most reliable way to prevent duplicate checkouts is to check the booking's status directly.
    if booking.status == "checked_out":
        raise HTTPException(status_code=409, detail=f"This booking has already been checked out.")

    all_rooms = bill_data["all_rooms"]
    charges = bill_data["charges"]
    is_package = bill_data["is_package"]
    room_ids = [room.id for room in all_rooms]

    try:
        # Calculate final bill with taxes
        subtotal = charges.total_due
        tax_amount = subtotal * 0.05  # Standard 5% Tax
        # Apply discount from the request, ensuring it's not negative
        discount_amount = max(0, request.discount_amount or 0)
        grand_total = max(0, subtotal + tax_amount - discount_amount)

        # Create a single checkout record for the entire booking
        new_checkout = Checkout(
            booking_id=booking.id if not is_package else None,
            package_booking_id=booking.id if is_package else None,
            room_total=charges.room_charges,
            food_total=charges.food_charges,
            service_total=charges.service_charges,
            package_total=charges.package_charges,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            grand_total=grand_total,
            payment_method=request.payment_method,
            payment_status="Paid",
            guest_name=booking.guest_name,
            room_number=", ".join(sorted([room.number for room in all_rooms]))
        )
        db.add(new_checkout)

        # Atomically update all related records
        db.query(FoodOrder).filter(FoodOrder.room_id.in_(room_ids), FoodOrder.billing_status == "unbilled").update({"billing_status": "billed"})
        db.query(AssignedService).filter(AssignedService.room_id.in_(room_ids), AssignedService.billing_status == "unbilled").update({"billing_status": "billed"})
        
        booking.status = "checked_out"
        db.query(Room).filter(Room.id.in_(room_ids)).update({"status": "Available"})

        db.commit()
        db.refresh(new_checkout)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed due to an internal error: {str(e)}")

    # Return the data from the newly created checkout record
    return CheckoutSuccess(
        checkout_id=new_checkout.id,
        grand_total=new_checkout.grand_total,
        checkout_date=new_checkout.checkout_date
    )
