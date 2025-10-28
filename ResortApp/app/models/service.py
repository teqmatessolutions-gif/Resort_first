from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class ServiceStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    charges = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    images = relationship("ServiceImage", back_populates="service", cascade="all, delete-orphan")

class AssignedService(Base):
    __tablename__ = "assigned_services"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(ServiceStatus), default=ServiceStatus.pending)
    billing_status = Column(String, default="unbilled")

    service = relationship("Service")
    employee = relationship("Employee")
    room = relationship("Room")


class ServiceImage(Base):
    __tablename__ = "service_images"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    image_url = Column(String, nullable=False)
    
    # Relationships
    service = relationship("Service", back_populates="images")
