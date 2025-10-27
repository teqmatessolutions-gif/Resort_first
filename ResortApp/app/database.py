from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Add SSL parameters and connection pool settings to fix connection issues
# SQLite doesn't support sslmode, so we check if it's SQLite
connect_args = {}
if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"sslmode": "disable"}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args if connect_args else {"check_same_thread": False},
    pool_size=5,  # Number of connections to maintain in the pool
    max_overflow=10,  # Additional connections that can be created on demand
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=False  # Set to True for SQL query logging
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
