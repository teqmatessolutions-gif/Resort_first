from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import List
from datetime import date, datetime

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
def get_all_checkouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 20):
    """Retrieves a list of all completed checkouts, ordered by most recent."""
    checkouts = db.query(Checkout).order_by(Checkout.id.desc()).offset(skip).limit(limit).all()
    return checkouts if checkouts else []

@router.get("/active-rooms", response_model=List[dict])
def get_active_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 20):
    """
    Returns a list of active rooms available for checkout with two options:
    1. Individual rooms (for single room checkout)
    2. Grouped bookings (for multiple room checkout together)
    Used to populate the checkout dropdown on the frontend.
    """
    try:
        # Fetch active bookings and package bookings with their rooms preloaded
        # Only include 'checked-in' status (both hyphen and underscore formats)
        # Exclude 'booked' status - only show rooms that are already checked-in
        active_bookings = db.query(Booking).options(
            joinedload(Booking.booking_rooms).joinedload(BookingRoom.room)
        ).filter(Booking.status.in_(['checked-in', 'checked_in'])).all()
        
        active_package_bookings = db.query(PackageBooking).options(
            joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room)
        ).filter(PackageBooking.status.in_(['checked-in', 'checked_in'])).all()
        
        result = []
        
        # Helper function to safely get room number
        def get_room_number(link):
            """Safely extract room number from booking room link"""
            try:
                if not link:
                    return None
                if not link.room:
                    return None
                room_num = link.room.number
                if room_num is None or (isinstance(room_num, str) and room_num.strip() == ""):
                    return None
                return str(room_num).strip()
            except (AttributeError, Exception):
                return None
        
        # Process regular bookings
        for booking in active_bookings:
            # Extract room numbers with proper null checks using helper function
            room_numbers = sorted([
                room_num for link in booking.booking_rooms 
                if (room_num := get_room_number(link)) is not None
            ])
            if room_numbers:
                # Add individual room options (one per room)
                for room_num in room_numbers:
                    result.append({
                        "room_number": room_num,
                        "room_numbers": [room_num],  # Single room
                        "guest_name": booking.guest_name,
                        "booking_id": booking.id,
                        "booking_type": "regular",
                        "checkout_mode": "single",
                        "display_label": f"Room {room_num} ({booking.guest_name})"
                    })
                
                # Add grouped booking option (all rooms together) - only if more than 1 room
                if len(room_numbers) > 1:
                    first_room = room_numbers[0]
                    result.append({
                        "room_number": first_room,  # Primary room for checkout API
                        "room_numbers": room_numbers,  # All rooms in this booking
                        "guest_name": booking.guest_name,
                        "booking_id": booking.id,
                        "booking_type": "regular",
                        "checkout_mode": "multiple",
                        "display_label": f"All Rooms in Booking #{booking.id}: {', '.join(room_numbers)} ({booking.guest_name})"
                    })
        
        # Process package bookings
        for pkg_booking in active_package_bookings:
            # Extract room numbers with proper null checks using helper function
            room_numbers = sorted([
                room_num for link in pkg_booking.rooms 
                if (room_num := get_room_number(link)) is not None
            ])
            if room_numbers:
                # Add individual room options (one per room)
                for room_num in room_numbers:
                    result.append({
                        "room_number": room_num,
                        "room_numbers": [room_num],  # Single room
                        "guest_name": pkg_booking.guest_name,
                        "booking_id": pkg_booking.id,
                        "booking_type": "package",
                        "checkout_mode": "single",
                        "display_label": f"Room {room_num} ({pkg_booking.guest_name})"
                    })
                
                # Add grouped booking option (all rooms together) - only if more than 1 room
                if len(room_numbers) > 1:
                    first_room = room_numbers[0]
                    result.append({
                        "room_number": first_room,  # Primary room for checkout API
                        "room_numbers": room_numbers,  # All rooms in this booking
                        "guest_name": pkg_booking.guest_name,
                        "booking_id": pkg_booking.id,
                        "booking_type": "package",
                        "checkout_mode": "multiple",
                        "display_label": f"All Rooms in Package #{pkg_booking.id}: {', '.join(room_numbers)} ({pkg_booking.guest_name})"
                    })
        
        # Sort by booking ID descending (most recent first)
        result = sorted(result, key=lambda x: x['booking_id'], reverse=True)
        return result[skip:skip+limit]
    except Exception as e:
        # Return empty list on error to prevent 500 response
        import traceback
        print(f"Error in get_active_rooms: {str(e)}")
        print(traceback.format_exc())
        return []

def _calculate_bill_for_single_room(db: Session, room_number: str):
    """
    Calculates bill for a single room only, regardless of how many rooms are in the booking.
    """
    # 1. Find the room
    room = db.query(Room).filter(Room.number == room_number).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")
    
    # 2. Find the active parent booking (regular or package) linked to this room
    booking, is_package = None, False
    
    booking_link = (db.query(BookingRoom)
                    .join(Booking)
                    .options(joinedload(BookingRoom.booking))
                    .filter(BookingRoom.room_id == room.id, Booking.status.in_(['checked-in', 'checked_in', 'booked']))
                    .order_by(Booking.id.desc()).first())
    
    if booking_link:
        booking = booking_link.booking
        if booking.status not in ['checked-in', 'checked_in', 'booked']:
            raise HTTPException(status_code=400, detail=f"Booking is not in a valid state for checkout. Current status: {booking.status}")
    else:
        package_link = (db.query(PackageBookingRoom)
                        .join(PackageBooking)
                        .options(joinedload(PackageBookingRoom.package_booking))
                        .filter(PackageBookingRoom.room_id == room.id, PackageBooking.status.in_(['checked-in', 'checked_in', 'booked']))
                        .order_by(PackageBooking.id.desc()).first())
        if package_link:
            booking = package_link.package_booking
            is_package = True
            if booking.status not in ['checked-in', 'checked_in', 'booked']:
                raise HTTPException(status_code=400, detail=f"Package booking is not in a valid state for checkout. Current status: {booking.status}")
    
    if not booking:
        raise HTTPException(status_code=404, detail=f"No active booking found for room {room_number}.")
    
    # 3. Calculate charges for THIS ROOM ONLY
    charges = BillBreakdown()
    
    # Calculate effective checkout date:
    # If actual checkout date (today) > booking.check_out (late checkout): use today
    # If actual checkout date (today) < booking.check_out (early checkout): use booking.check_out
    today = date.today()
    effective_checkout_date = max(today, booking.check_out)
    stay_days = max(1, (effective_checkout_date - booking.check_in).days)
    
    if is_package:
        # Package price is per room, per night
        package_price_per_room = booking.package.price if booking.package else 0
        charges.package_charges = package_price_per_room * stay_days
        charges.room_charges = 0
    else:
        charges.package_charges = 0
        charges.room_charges = (room.price or 0) * stay_days
    
    # Get food and service charges for THIS ROOM ONLY
    unbilled_food_order_items = (db.query(FoodOrderItem)
                                 .join(FoodOrder)
                                 .options(joinedload(FoodOrderItem.food_item))
                                 .filter(FoodOrder.room_id == room.id, FoodOrder.billing_status == "unbilled")
                                 .all())
    
    unbilled_services = db.query(AssignedService).options(joinedload(AssignedService.service)).filter(AssignedService.room_id == room.id, AssignedService.billing_status == "unbilled").all()
    
    charges.food_charges = sum(item.quantity * item.food_item.price for item in unbilled_food_order_items if item.food_item)
    charges.service_charges = sum(ass.service.charges for ass in unbilled_services)
    
    charges.food_items = [{"item_name": item.food_item.name, "quantity": item.quantity, "amount": item.quantity * item.food_item.price} for item in unbilled_food_order_items if item.food_item]
    charges.service_items = [{"service_name": ass.service.name, "charges": ass.service.charges} for ass in unbilled_services]
    
    charges.total_due = sum([charges.room_charges, charges.food_charges, charges.service_charges, charges.package_charges])
    
    number_of_guests = getattr(booking, 'number_of_guests', 1)
    
    return {
        "booking": booking, "room": room, "charges": charges,
        "is_package": is_package, "stay_nights": stay_days, "number_of_guests": number_of_guests,
        "effective_checkout_date": effective_checkout_date
    }

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
    # Handle both 'checked-in' and 'checked_in' status formats
    booking_link = (db.query(BookingRoom)
                    .join(Booking)
                    .options(joinedload(BookingRoom.booking)) # Eager load the booking
                    .filter(BookingRoom.room_id == initial_room.id, Booking.status.in_(['checked-in', 'checked_in', 'booked']))
                    .order_by(Booking.id.desc()).first())

    if booking_link:
        booking = booking_link.booking
        # Validate booking status before proceeding
        if booking.status not in ['checked-in', 'checked_in', 'booked']:
            raise HTTPException(status_code=400, detail=f"Booking is not in a valid state for checkout. Current status: {booking.status}")
    else:
        package_link = (db.query(PackageBookingRoom)
                        .join(PackageBooking)
                        .options(joinedload(PackageBookingRoom.package_booking)) # Eager load the booking
                        .filter(PackageBookingRoom.room_id == initial_room.id, PackageBooking.status.in_(['checked-in', 'checked_in', 'booked']))
                        .order_by(PackageBooking.id.desc()).first())
        if package_link:
            booking = package_link.package_booking
            is_package = True
            # Validate booking status before proceeding
            if booking.status not in ['checked-in', 'checked_in', 'booked']:
                raise HTTPException(status_code=400, detail=f"Package booking is not in a valid state for checkout. Current status: {booking.status}")

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
    
    # Calculate effective checkout date:
    # If actual checkout date (today) > booking.check_out (late checkout): use today
    # If actual checkout date (today) < booking.check_out (early checkout): use booking.check_out
    today = date.today()
    effective_checkout_date = max(today, booking.check_out)
    stay_days = max(1, (effective_checkout_date - booking.check_in).days)

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
        "is_package": is_package, "stay_nights": stay_days, "number_of_guests": number_of_guests,
        "effective_checkout_date": effective_checkout_date
    }


@router.get("/{room_number}", response_model=BillSummary)
def get_bill_for_booking(room_number: str, checkout_mode: str = "multiple", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a bill summary for the booking associated with the given room number.
    If checkout_mode is 'single', calculates bill for that room only.
    If checkout_mode is 'multiple', calculates bill for all rooms in the booking.
    """
    if checkout_mode == "single":
        bill_data = _calculate_bill_for_single_room(db, room_number)
        effective_checkout = bill_data.get("effective_checkout_date", bill_data["booking"].check_out)
        return BillSummary(
            guest_name=bill_data["booking"].guest_name,
            room_numbers=[bill_data["room"].number],
            number_of_guests=bill_data["number_of_guests"],
            stay_nights=bill_data["stay_nights"],
            check_in=bill_data["booking"].check_in,
            check_out=effective_checkout,  # Use effective checkout date (today if late, booking.check_out if early)
            charges=bill_data["charges"]
        )
    else:
        bill_data = _calculate_bill_for_entire_booking(db, room_number)
        effective_checkout = bill_data.get("effective_checkout_date", bill_data["booking"].check_out)
        return BillSummary(
            guest_name=bill_data["booking"].guest_name,
            room_numbers=sorted([room.number for room in bill_data["all_rooms"]]),
            number_of_guests=bill_data["number_of_guests"],
            stay_nights=bill_data["stay_nights"],
            check_in=bill_data["booking"].check_in,
            check_out=effective_checkout,  # Use effective checkout date (today if late, booking.check_out if early)
            charges=bill_data["charges"]
        )


@router.post("/checkout/{room_number}", response_model=CheckoutSuccess)
def process_booking_checkout(room_number: str, request: CheckoutRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Finalizes the checkout for a room or entire booking.
    If checkout_mode is 'single', only the specified room is checked out.
    If checkout_mode is 'multiple', all rooms in the booking are checked out together.
    """
    checkout_mode = request.checkout_mode or "multiple"
    
    # Ensure checkout_mode is valid
    if checkout_mode not in ["single", "multiple"]:
        checkout_mode = "multiple"  # Default to multiple if invalid
    
    if checkout_mode == "single":
        # Single room checkout
        # First, check if room exists and is already checked out BEFORE calculating bill
        room = db.query(Room).filter(Room.number == room_number).first()
        if not room:
            raise HTTPException(status_code=404, detail=f"Room {room_number} not found.")
        
        if room.status == "Available":
            raise HTTPException(
                status_code=409, 
                detail=f"Room {room_number} has already been checked out and is currently available. Please select a different room."
            )
        
        # Now calculate bill
        bill_data = _calculate_bill_for_single_room(db, room_number)
        booking = bill_data["booking"]
        charges = bill_data["charges"]
        is_package = bill_data["is_package"]
        
        # Check if there's already a checkout for this specific room today (to prevent duplicates)
        today = date.today()
        existing_room_checkout = db.query(Checkout).filter(
            Checkout.room_number == room_number,
            func.date(Checkout.checkout_date) == today
        ).first()
        if existing_room_checkout:
            raise HTTPException(
                status_code=409,
                detail=f"Room {room_number} was already checked out today (Checkout ID: {existing_room_checkout.id}). Please refresh the page to see updated room status."
            )
        
        # Validate booking is in a valid state
        if booking.status not in ['checked-in', 'checked_in', 'booked']:
            raise HTTPException(status_code=400, detail=f"Booking cannot be checked out. Current status: {booking.status}")
        
        try:
            # Calculate final bill with taxes
            subtotal = charges.total_due
            tax_amount = subtotal * 0.05
            discount_amount = max(0, request.discount_amount or 0)
            grand_total = max(0, subtotal + tax_amount - discount_amount)
            
            # Get effective checkout date for billing (today if late checkout, booking.check_out if early)
            effective_checkout = bill_data.get("effective_checkout_date", booking.check_out)
            # Convert date to datetime for checkout_date field
            effective_checkout_datetime = datetime.combine(effective_checkout, datetime.min.time())
            
            # Create checkout record for single room
            # For single room checkout, we need to link to booking_id/package_booking_id for display
            # However, unique constraint on booking_id prevents multiple single-room checkouts from same booking
            # Solution: Only set booking_id/package_booking_id if this is the first checkout for this booking
            # Otherwise, leave it NULL and rely on room_number for tracking
            
            # Check if there's already a checkout with this booking_id (multiple room checkout case)
            existing_booking_checkout = None
            if not is_package:
                existing_booking_checkout = db.query(Checkout).filter(Checkout.booking_id == booking.id).first()
            else:
                existing_booking_checkout = db.query(Checkout).filter(Checkout.package_booking_id == booking.id).first()
            
            # Set booking_id/package_booking_id only if no checkout exists for this booking yet
            # This ensures at least one checkout per booking shows the booking_id
            booking_id_to_set = None
            package_booking_id_to_set = None
            
            if not existing_booking_checkout:
                # First checkout for this booking - set the IDs
                booking_id_to_set = booking.id if not is_package else None
                package_booking_id_to_set = booking.id if is_package else None
            
            new_checkout = Checkout(
                booking_id=booking_id_to_set,  # Set only for first checkout per booking
                package_booking_id=package_booking_id_to_set,  # Set only for first checkout per booking
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
                room_number=room.number,
                checkout_date=effective_checkout_datetime  # Use effective checkout date
            )
            db.add(new_checkout)
            
            # Update only this room's related records
            db.query(FoodOrder).filter(FoodOrder.room_id == room.id, FoodOrder.billing_status == "unbilled").update({"billing_status": "billed"})
            db.query(AssignedService).filter(AssignedService.room_id == room.id, AssignedService.billing_status == "unbilled").update({"billing_status": "billed"})
            
            # Update room status only (don't change booking status)
            room.status = "Available"
            
            # Check if all rooms in booking are checked out, then update booking status
            if is_package:
                remaining_rooms = [link.room for link in booking.rooms if link.room.status != "Available"]
            else:
                remaining_rooms = [link.room for link in booking.booking_rooms if link.room.status != "Available"]
            
            if not remaining_rooms:
                # All rooms checked out, mark booking as checked out
                booking.status = "checked_out"
            
            db.commit()
            db.refresh(new_checkout)
            
        except Exception as e:
            db.rollback()
            error_detail = str(e)
            # Check for unique constraint violation
            if "unique constraint" in error_detail.lower() or "duplicate key" in error_detail.lower() or "23505" in error_detail:
                raise HTTPException(
                    status_code=409, 
                    detail=f"Checkout failed: A checkout record may already exist for this booking."
                )
            raise HTTPException(status_code=500, detail=f"Checkout failed due to an internal error: {error_detail}")
        
        return CheckoutSuccess(
            checkout_id=new_checkout.id,
            grand_total=new_checkout.grand_total,
            checkout_date=new_checkout.checkout_date or new_checkout.created_at
        )
    
    else:
        # Multiple room checkout (entire booking)
        bill_data = _calculate_bill_for_entire_booking(db, room_number)
        
        booking = bill_data["booking"]
        all_rooms = bill_data["all_rooms"]
        charges = bill_data["charges"]
        is_package = bill_data["is_package"]
        room_ids = [room.id for room in all_rooms]
        
        # Check if booking is already checked out
        if booking.status in ["checked_out", "checked-out"]:
            raise HTTPException(status_code=409, detail=f"This booking has already been checked out.")
        
        # Validate booking is in a valid state for checkout
        if booking.status not in ['checked-in', 'checked_in', 'booked']:
            raise HTTPException(status_code=400, detail=f"Booking cannot be checked out. Current status: {booking.status}")
        
        # Check if a checkout record already exists for this booking (unique constraint)
        existing_checkout = None
        if not is_package:
            existing_checkout = db.query(Checkout).filter(Checkout.booking_id == booking.id).first()
        else:
            existing_checkout = db.query(Checkout).filter(Checkout.package_booking_id == booking.id).first()
        
        if existing_checkout:
            raise HTTPException(status_code=409, detail=f"This booking has already been checked out. Checkout ID: {existing_checkout.id}")
        
        # Check if any rooms are already checked out
        already_checked_out_rooms = [room.number for room in all_rooms if room.status == "Available"]
        if already_checked_out_rooms:
            raise HTTPException(
                status_code=409, 
                detail=f"Some rooms in this booking are already checked out: {', '.join(already_checked_out_rooms)}. Please checkout remaining rooms individually or select rooms that are still checked in."
            )
        
        try:
            # Calculate final bill with taxes
            subtotal = charges.total_due
            tax_amount = subtotal * 0.05  # Standard 5% Tax
            # Apply discount from the request, ensuring it's not negative
            discount_amount = max(0, request.discount_amount or 0)
            grand_total = max(0, subtotal + tax_amount - discount_amount)
            
            # Get effective checkout date for billing (today if late checkout, booking.check_out if early)
            effective_checkout = bill_data.get("effective_checkout_date", booking.check_out)
            # Convert date to datetime for checkout_date field
            effective_checkout_datetime = datetime.combine(effective_checkout, datetime.min.time())
            
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
                room_number=", ".join(sorted([room.number for room in all_rooms])),
                checkout_date=effective_checkout_datetime  # Use effective checkout date
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
            error_detail = str(e)
            # Check for unique constraint violation (postgres error code 23505)
            if "unique constraint" in error_detail.lower() or "duplicate key" in error_detail.lower() or "23505" in error_detail:
                raise HTTPException(
                    status_code=409, 
                    detail=f"This booking has already been checked out. A checkout record already exists for this booking."
                )
            raise HTTPException(status_code=500, detail=f"Checkout failed due to an internal error: {error_detail}")
        
        # Return the data from the newly created checkout record
        return CheckoutSuccess(
            checkout_id=new_checkout.id,
            grand_total=new_checkout.grand_total,
            checkout_date=new_checkout.checkout_date or new_checkout.created_at
        )
