from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Date
from datetime import date, timedelta

from app.utils.auth import get_db
from app.models.checkout import Checkout
from app.models.room import Room
from app.models.booking import Booking, BookingRoom
from app.models.Package import Package, PackageBooking, PackageBookingRoom
from app.models.foodorder import FoodOrder
from app.models.food_item import FoodItem
from app.models.expense import Expense
from app.models.employee import Employee
from app.models.service import Service, AssignedService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    """
    Calculates and returns key performance indicators for the dashboard.
    """
    today = date.today()

    # 1. Checkout KPIs
    checkouts_today = db.query(Checkout).filter(func.cast(Checkout.checkout_date, Date) == today).count()
    checkouts_total = db.query(Checkout).count()

    # 2. Room Status KPIs
    all_rooms = db.query(Room).all()
    booked_room_ids = set()

    # Find rooms booked via regular bookings
    active_bookings = db.query(BookingRoom.room_id).join(Booking).filter(
        Booking.status == "booked",
        Booking.check_in <= today,
        Booking.check_out > today,
    ).all()
    booked_room_ids.update([r.room_id for r in active_bookings])

    # Find rooms booked via package bookings
    active_package_bookings = db.query(PackageBookingRoom.room_id).join(PackageBooking).filter(
        PackageBooking.status == "booked",
        PackageBooking.check_in <= today,
        PackageBooking.check_out > today,
    ).all()
    booked_room_ids.update([r.room_id for r in active_package_bookings])

    booked_rooms_count = len(booked_room_ids)
    maintenance_rooms_count = db.query(Room).filter(func.lower(Room.status) == "maintenance").count()
    total_rooms_count = len(all_rooms)
    available_rooms_count = total_rooms_count - booked_rooms_count - maintenance_rooms_count

    # 3. Food Revenue KPI
    # Assuming FoodOrder has a 'created_at' field. If not, this needs adjustment.
    food_revenue_today = db.query(func.sum(FoodOrder.amount)).filter(
        func.cast(FoodOrder.created_at, Date) == today
    ).scalar() or 0

    # 4. Package Booking KPI
    package_bookings_today = db.query(PackageBooking).filter(
        func.cast(PackageBooking.check_in, Date) == today
    ).count()

    return [{
        "checkouts_today": checkouts_today,
        "checkouts_total": checkouts_total,
        "available_rooms": available_rooms_count,
        "booked_rooms": booked_rooms_count,
        "food_revenue_today": food_revenue_today,
        "package_bookings_today": package_bookings_today,
    }]

@router.get("/charts")
def get_chart_data(db: Session = Depends(get_db)):
    """
    Provides data for the main dashboard charts.
    """
    # Simplified version to avoid complex queries that might cause issues
    revenue_breakdown = [
        {"name": 'Room Charges', "value": 0.0},
        {"name": 'Package Charges', "value": 0.0},
        {"name": 'Food & Beverage', "value": 0.0},
    ]

    # Simplified weekly performance
    weekly_performance = []
    today = date.today()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        weekly_performance.append({
            "day": day.strftime("%a"),
            "revenue": 0.0,
            "checkouts": 0
        })

    return {
        "revenue_breakdown": revenue_breakdown,
        "weekly_performance": weekly_performance
    }

@router.get("/reports")
def get_reports_data(db: Session = Depends(get_db)):
    """
    Provides a consolidated dataset for the main reports/account page.
    """
    # Fetch recent bookings (regular and package)
    recent_bookings = db.query(Booking).order_by(Booking.id.desc()).limit(5).all()
    recent_package_bookings = db.query(PackageBooking).order_by(PackageBooking.id.desc()).limit(5).all()

    # Combine and sort by date (assuming they have a comparable date field)
    # For this example, we'll just interleave them, but a real case might sort by a 'created_at'
    all_recent = sorted(
        [{"type": "Booking", "guest_name": b.guest_name, "status": b.status, "check_in": b.check_in, "id": f"B-{b.id}"} for b in recent_bookings] +
        [{"type": "Package", "guest_name": pb.guest_name, "status": pb.status, "check_in": pb.check_in, "id": f"P-{pb.id}"} for pb in recent_package_bookings],
        key=lambda x: x['check_in'],
        reverse=True
    )[:5]

    # Format expenses data into a JSON-friendly structure
    expenses_query_result = db.query(Expense.category, func.sum(Expense.amount).label("total_amount")).group_by(Expense.category).all()
    expenses_by_category = [{"category": category, "amount": total_amount} for category, total_amount in expenses_query_result]

    return [{
        "kpis": {
            "total_revenue": db.query(func.sum(Checkout.grand_total)).scalar() or 0,
            "total_expenses": db.query(func.sum(Expense.amount)).scalar() or 0,
            "total_bookings": db.query(Booking).count() + db.query(PackageBooking).count(),
            "active_employees": db.query(Employee).count(),
            "total_rooms": db.query(Room).count(),
        },
        "recent_bookings": all_recent,
        "expenses_by_category": expenses_by_category,
    }]


def get_date_range(period: str):
    """Helper to determine start and end dates based on a string period."""
    today = date.today()
    if period == "day":
        start_date = today
        end_date = today + timedelta(days=1)
    elif period == "week":
        start_date = today - timedelta(days=today.weekday())  # Monday
        end_date = start_date + timedelta(days=7)
    elif period == "month":
        start_date = today.replace(day=1)
        # Find the first day of the next month to use as an exclusive end date
        next_month = (start_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        end_date = next_month
    else:  # "all"
        start_date, end_date = None, None
    return start_date, end_date


@router.get("/summary")
def get_summary(period: str = "all", db: Session = Depends(get_db)):
    """
    Provides a comprehensive summary of KPIs for a given period (day, week, month, all).
    """
    start_date, end_date = get_date_range(period)

    def apply_date_filter(query, date_column):
        """Applies a date range filter to a SQLAlchemy query if dates are provided."""
        if start_date:
            query = query.filter(date_column >= start_date)
        if end_date:
            # Use '<' for the end date to correctly handle date ranges
            query = query.filter(date_column < end_date)
        return query

    # --- KPI Calculations ---

    # Bookings
    room_bookings_query = apply_date_filter(db.query(Booking), Booking.check_in)
    package_bookings_query = apply_date_filter(db.query(PackageBooking), PackageBooking.check_in)

    # Expenses
    expenses_query = apply_date_filter(db.query(Expense), Expense.date)
    total_expenses = expenses_query.with_entities(func.sum(Expense.amount)).scalar() or 0

    # Food Orders
    food_orders_query = apply_date_filter(db.query(FoodOrder), FoodOrder.created_at)

    # Services
    services_query = apply_date_filter(db.query(AssignedService), AssignedService.assigned_at)

    # Employees
    employees_query = apply_date_filter(db.query(Employee), Employee.join_date)
    total_salary_query = db.query(func.sum(Employee.salary))
    if start_date: # Only filter salary for active employees if there's a date range
        total_salary_query = apply_date_filter(total_salary_query, Employee.join_date)

    kpis = {
        "room_bookings": room_bookings_query.count(),
        "package_bookings": package_bookings_query.count(),
        "total_bookings": room_bookings_query.count() + package_bookings_query.count(),
        
        "assigned_services": services_query.count(),
        "completed_services": services_query.filter(AssignedService.status == 'completed').count(),
        
        "food_orders": food_orders_query.count(),
        "food_items_available": db.query(FoodItem).filter(FoodItem.available == "True").count(),
        
        "total_expenses": total_expenses,
        "expense_count": expenses_query.count(),
        
        "active_employees": employees_query.count(),
        "total_salary": total_salary_query.scalar() or 0,
    }

    return kpis