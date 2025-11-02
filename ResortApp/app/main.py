from fastapi import FastAPI
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os


# API Routers
from app.api import (
    attendance,
    auth,
    booking,
    checkout,
    dashboard,
    employee,
    expenses,
    food_category,
    food_item,
    food_orders,
    frontend,
    packages,
    payment,
    report,
    role,
    room,
    service,
    user,
)

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file dirs
UPLOAD_DIR = "uploads/expenses"
os.makedirs("static/rooms", exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register Routers with /api prefix to match nginx configuration
app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(role.router, prefix="/api")
app.include_router(employee.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(room.router, prefix="/api")
app.include_router(packages.router, prefix="/api")
app.include_router(booking.router, prefix="/api")
app.include_router(checkout.router, prefix="/api")
app.include_router(food_category.router, prefix="/api")
app.include_router(food_item.router, prefix="/api")
app.include_router(food_orders.router, prefix="/api")
app.include_router(service.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(frontend.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(report.router, prefix="/api")
# app.include_router(guest_api.guest_router) # <--- And add this line
# app.include_router(billing_api.router) # <-- Now billing is active