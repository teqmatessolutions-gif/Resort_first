from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Add SSL parameters and connection pool settings to fix connection issues
# Increased pool size for production stability
# SQLite doesn't support sslmode, so we check if it's SQLite
connect_args = {}
if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "sslmode": "disable",  # Disable SSL for local connections
        "connect_timeout": 10,  # Connection timeout in seconds
        "options": "-c statement_timeout=30000"  # 30 second statement timeout
    }
else:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_size=20,  # Increased pool size for multiple workers (production)
    max_overflow=30,  # Additional connections that can be created on demand
    pool_pre_ping=True,  # Verify connections before use (fixes connection drops)
    pool_recycle=1800,  # Recycle connections after 30 minutes to prevent stale connections
    pool_timeout=30,  # Timeout for getting connection from pool
    echo=False,  # Set to True for SQL query logging
    execution_options={
        "isolation_level": "READ COMMITTED"  # Better concurrency with read committed
    } if not SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
