from sqlalchemy import Column, Integer, String, Boolean, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# Header & Banner
class HeaderBanner(Base):
    __tablename__ = "header_banner"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    subtitle = Column(String(255))
    image_url = Column(String(255))
    is_active = Column(Boolean, default=True)


# Check Availability Form
class CheckAvailability(Base):
    __tablename__ = "check_availability"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    check_in = Column(Date)
    check_out = Column(Date)
    guests = Column(Integer)
    is_active = Column(Boolean, default=True)


# Gallery
class Gallery(Base):
    __tablename__ = "gallery"
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(255))
    caption = Column(String(255))
    is_active = Column(Boolean, default=True)


# Reviews
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    comment = Column(Text)
    rating = Column(Integer)
    is_active = Column(Boolean, default=True)


# Resort Info & Social Media
class ResortInfo(Base):
    __tablename__ = "resort_info"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    address = Column(Text)
    facebook = Column(String(255))
    instagram = Column(String(255))
    twitter = Column(String(255))
    linkedin = Column(String(255))
    is_active = Column(Boolean, default=True)
