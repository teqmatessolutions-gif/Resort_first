from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional


class PackageImageOut(BaseModel):
    id: int
    image_url: str

    class Config:
        from_attributes = True


class PackageOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    images: List[PackageImageOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


# New schema to represent the Room model
class RoomOut(BaseModel):
    id: int
    number: str
    type: str

    class Config:
        from_attributes = True


# Updated schema to correctly nest the RoomOut model
class PackageBookingRoomOut(BaseModel):
    id: int
    room_id: int
    room: Optional[RoomOut] = None# ✅ match SQLAlchemy relationship

    class Config:
        from_attributes = True

class PackageBookingBase(BaseModel):
    package_id: int
    guest_name: str
    guest_email: Optional[str] = None
    guest_mobile: Optional[str] = None
    check_in: date
    check_out: date
    adults: int = 2
    children: int = 0
    class Config:
        from_attributes = True


class PackageBookingCreate(PackageBookingBase):
    room_ids: List[int]
    class Config:
        from_attributes = True


class PackageBookingUpdate(BaseModel):
    status: Optional[str] = None
    adults: Optional[int] = None
    children: Optional[int] = None
    class Config:
        from_attributes = True


class PackageBookingOut(PackageBookingBase):
    id: int
    status: str
    rooms: List[PackageBookingRoomOut] = Field(default_factory=list)
    package: Optional[PackageOut]

    class Config:
        from_attributes = True
