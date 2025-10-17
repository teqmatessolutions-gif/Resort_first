from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.postgresql import ARRAY

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    permissions = Column(ARRAY(String), nullable=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    bookings = relationship("Booking", back_populates="user")
    role = relationship("Role", back_populates="users")
    package_bookings = relationship("PackageBooking", back_populates="user")
    employee = relationship("Employee", back_populates="user", uselist=False) 
    
