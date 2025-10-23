from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os

# Import all API routers
from app.api import (
    packages,
    room,
    user,
    auth,
    frontend,
    booking,
    checkout,
    dashboard,
    employee,
    expenses,
    food_category,
    food_item,
    food_orders,
    payment,
    report,
    reports,
    role,
    service,
    attendance,
)
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Resort Management System",
    description="Complete resort management system with booking, payments, and customer management",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file directories
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mount landing page static files
landing_page_path = Path("../landingpage")
if landing_page_path.exists():
    app.mount("/landing", StaticFiles(directory="../landingpage"), name="landing")

# Mount dashboard build files (React build)
dashboard_build_path = Path("../dasboard/build")
if dashboard_build_path.exists():
    app.mount(
        "/admin-static",
        StaticFiles(directory="../dasboard/build/static"),
        name="admin-static",
    )

# Mount user end build files
userend_build_path = Path("../userend/build")
if userend_build_path.exists():
    app.mount(
        "/user-static",
        StaticFiles(directory="../userend/build/static"),
        name="user-static",
    )

# API Routes
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(user.router, prefix="/api", tags=["Users"])
app.include_router(room.router, prefix="/api", tags=["Rooms"])
app.include_router(packages.router, prefix="/api", tags=["Packages"])
app.include_router(frontend.router, prefix="/api", tags=["Frontend"])
app.include_router(booking.router, prefix="/api", tags=["Booking"])
app.include_router(checkout.router, prefix="/api", tags=["Checkout"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(employee.router, prefix="/api", tags=["Employee"])
app.include_router(expenses.router, prefix="/api", tags=["Expenses"])
app.include_router(food_category.router, prefix="/api", tags=["Food Category"])
app.include_router(food_item.router, prefix="/api", tags=["Food Items"])
app.include_router(food_orders.router, prefix="/api", tags=["Food Orders"])
app.include_router(payment.router, prefix="/api", tags=["Payment"])
app.include_router(report.router, prefix="/api", tags=["Report"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(role.router, prefix="/api", tags=["Role"])
app.include_router(service.router, prefix="/api", tags=["Service"])
app.include_router(attendance.router, prefix="/api", tags=["Attendance"])


# Root route - Landing Page
@app.get("/", response_class=HTMLResponse)
async def landing_page():
    """Serve the landing page at www.teqmates.com"""
    landing_file = Path("../landingpage/index.html")
    if landing_file.exists():
        return FileResponse(landing_file)
    return HTMLResponse(
        "<h1>Welcome to TeqMates Resort</h1><p>Landing page not found</p>"
    )


# Admin Dashboard route
@app.get("/admin", response_class=HTMLResponse)
@app.get("/admin/{path:path}", response_class=HTMLResponse)
async def admin_dashboard(request: Request, path: str = ""):
    """Serve the React admin dashboard at www.teqmates.com/admin"""
    dashboard_file = Path("../dasboard/build/index.html")
    if dashboard_file.exists():
        return FileResponse(dashboard_file)
    return HTMLResponse("<h1>Admin Dashboard</h1><p>Dashboard not found</p>")


# User/Resort route
@app.get("/resort", response_class=HTMLResponse)
@app.get("/resort/{path:path}", response_class=HTMLResponse)
async def user_page(request: Request, path: str = ""):
    """Serve the user interface at www.teqmates.com/resort"""
    userend_file = Path("../userend/build/index.html")
    if userend_file.exists():
        return FileResponse(userend_file)

    # Fallback to a simple user interface
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Resort User Interface</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Resort User Interface</h1>
                <p>Welcome to TeqMates Resort Management</p>
            </div>
            <div class="content">
                <h2>Available Services</h2>
                <ul>
                    <li>Room Booking</li>
                    <li>Package Selection</li>
                    <li>Food Ordering</li>
                    <li>Service Requests</li>
                </ul>
                <p>Please contact the administrator to set up the user interface.</p>
            </div>
        </div>
    </body>
    </html>
    """)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "message": "Resort Management System is running"}


# API documentation redirect
@app.get("/api-docs")
async def api_docs():
    """Redirect to API documentation"""
    return {"message": "API documentation available at /docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
