from pydantic import BaseModel
from typing import List, Optional

class FoodItemImageOut(BaseModel):
    id: int
    image_url: str

    class Config:
        orm_mode = True

class FoodItemCreate(BaseModel):
    name: str
    description: str
    price: float
    available: bool
    category_id: int

class FoodItemOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    available: bool
    category_id: int
    images: List[FoodItemImageOut] = []

    class Config:
        orm_mode = True
