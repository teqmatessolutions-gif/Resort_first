from app.models.food_item import FoodItem, FoodItemImage
from app.schemas.food_item import FoodItemCreate
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

def create_food_item(db: Session, item: FoodItemCreate, image_paths: list[str]):
    db_item = FoodItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    for path in image_paths:
        image = FoodItemImage(image_url=path, item_id=db_item.id)
        db.add(image)

    db.commit()
    db.refresh(db_item)
    return db_item

def get_all_food_items(db: Session, skip: int = 0, limit: int = 100):
    items = db.query(FoodItem).options(joinedload(FoodItem.images)).offset(skip).limit(limit).all()
    return items 

def delete_food_item(db: Session, item_id: int):
    item = db.query(FoodItem).filter(FoodItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
        return {"msg": "Deleted"}
    return {"msg": "Not found"}

def update_food_item_availability(db: Session, item_id: int, available: bool):
    item = db.query(FoodItem).filter(FoodItem.id == item_id).first()
    if item:
        item.available = available
        db.commit()
        return {"msg": "Availability updated"}
    return {"msg": "Item not found"}
