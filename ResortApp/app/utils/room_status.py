from sqlalchemy.orm import Session
from app.models.room import Room
from app.models.booking import Booking, BookingRoom
from datetime import date

def update_room_statuses(db: Session):
    """
    Update room statuses based on current bookings.
    This function should be called periodically to keep room statuses accurate.
    """
    try:
        today = date.today()
        rooms = db.query(Room).all()
        
        for room in rooms:
            # Check if room has active bookings
            active_booking = db.query(BookingRoom).join(Booking).filter(
                BookingRoom.room_id == room.id,
                Booking.status.in_(['booked', 'checked-in']),
                Booking.check_in <= today,
                Booking.check_out > today
            ).first()
            
            if active_booking:
                # Room is currently occupied
                if room.status != "Occupied":
                    room.status = "Occupied"
            elif room.status == "Booked":
                # Check if booking has ended
                past_booking = db.query(BookingRoom).join(Booking).filter(
                    BookingRoom.room_id == room.id,
                    Booking.status.in_(['booked', 'checked-in']),
                    Booking.check_out <= today
                ).first()
                
                if past_booking:
                    # Booking has ended, make room available
                    room.status = "Available"
            elif room.status == "Occupied":
                # Check if there's no active booking
                no_active_booking = not db.query(BookingRoom).join(Booking).filter(
                    BookingRoom.room_id == room.id,
                    Booking.status.in_(['booked', 'checked-in']),
                    Booking.check_in <= today,
                    Booking.check_out > today
                ).first()
                
                if no_active_booking:
                    room.status = "Available"
        
        db.commit()
        print(f"Updated room statuses for {len(rooms)} rooms")
        
    except Exception as e:
        db.rollback()
        print(f"Error updating room statuses: {e}")
        raise e
