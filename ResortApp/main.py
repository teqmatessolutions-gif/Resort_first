from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from app.api import (
    packages,
    rooms,
    users,
    auth,
    booking,
    dashboard,
    employee,
    expenses,
    food_category,
    food_item,
    food_orders,
    frontend,
    payment,
    service,
    role,
)
from app.database import engine, Base

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# App configuration
app = FastAPI(
    title="Resort Management API",
    description="Comprehensive API for Resort Management System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS Configuration
origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware for security
trusted_hosts = os.getenv(
    "TRUSTED_HOSTS", "localhost,127.0.0.1,teqmates.com,www.teqmates.com"
).split(",")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# Mount the static files directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    try:
        # Test database connection
        from app.database import SessionLocal

        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()

        return {
            "status": "healthy",
            "message": "Resort Management API is running",
            "version": "1.0.0",
            "database": "connected",
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "message": "Service temporarily unavailable",
                "error": str(e),
            },
        )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Resort Management System API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc",
        "health": "/health",
    }


# API endpoint redirect
@app.get("/api")
async def api_root():
    """API root endpoint"""
    return {
        "message": "Resort Management System API v1.0.0",
        "documentation": "/api/docs",
        "health_check": "/health",
    }


# Include API routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(packages.router, prefix="/api")
app.include_router(booking.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(employee.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(food_category.router, prefix="/api")
app.include_router(food_item.router, prefix="/api")
app.include_router(food_orders.router, prefix="/api")
app.include_router(frontend.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(service.router, prefix="/api")
app.include_router(role.router, prefix="/api")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "detail": str(exc)
            if os.getenv("DEBUG", "False").lower() == "true"
            else None,
        },
    )


# Custom 404 handler
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "path": str(request.url.path),
        },
    )


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "False").lower() == "true"

    uvicorn.run(
        "main:app", host=host, port=port, reload=debug, workers=1 if debug else 4
    )
