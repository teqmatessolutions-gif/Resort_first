from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    charges: float

class ServiceCreate(ServiceBase):
    pass

class ServiceOut(ServiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# For employee and room resolution
class EmployeeOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class RoomOut(BaseModel):
    id: int
    number: str

    class Config:
        from_attributes = True

class ServiceStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class AssignedServiceBase(BaseModel):
    service_id: int
    employee_id: int
    room_id: int

class AssignedServiceCreate(AssignedServiceBase):
    pass

class AssignedServiceUpdate(BaseModel):
    status: ServiceStatus

class AssignedServiceOut(BaseModel):
    id: int
    service: ServiceOut
    employee: EmployeeOut
    room: RoomOut
    assigned_at: datetime
    status: ServiceStatus

    class Config:
        from_attributes = True
