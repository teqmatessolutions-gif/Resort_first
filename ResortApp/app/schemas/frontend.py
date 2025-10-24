from pydantic import BaseModel
from datetime import date

# Base schema with is_active
class BaseSchema(BaseModel):
    is_active: bool = True

    class Config:
        from_attributes = True


# Header & Banner
class HeaderBannerBase(BaseSchema):
    title: str
    subtitle: str
    image_url: str

class HeaderBannerCreate(HeaderBannerBase):
    pass

class HeaderBanner(HeaderBannerBase):
    id: int


# Check Availability
class CheckAvailabilityBase(BaseSchema):
    name: str
    email: str
    phone: str
    check_in: date
    check_out: date
    guests: int

class CheckAvailabilityCreate(CheckAvailabilityBase):
    pass

class CheckAvailability(CheckAvailabilityBase):
    id: int


# Gallery
class GalleryBase(BaseSchema):
    image_url: str
    caption: str

class GalleryCreate(GalleryBase):
    pass

class Gallery(GalleryBase):
    id: int


# Reviews
class ReviewBase(BaseSchema):
    name: str
    comment: str
    rating: int

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int


# Resort Info
class ResortInfoBase(BaseSchema):
    name: str
    address: str
    facebook: str | None = None
    instagram: str | None = None
    twitter: str | None = None
    linkedin: str | None = None

class ResortInfoCreate(ResortInfoBase):
    pass

class ResortInfo(ResortInfoBase):
    id: int
