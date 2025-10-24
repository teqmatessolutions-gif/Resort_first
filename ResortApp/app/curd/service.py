from sqlalchemy.orm import Session, joinedload
from app.models.service import Service, AssignedService
from app.schemas.service import ServiceCreate, AssignedServiceCreate, AssignedServiceUpdate

def create_service(db: Session, service: ServiceCreate):
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Service).offset(skip).limit(limit).all()

def delete_service(db: Session, service_id: int):
    service = db.query(Service).filter(Service.id == service_id).first()
    if service:
        db.delete(service)
        db.commit()
        return True
    return False

def create_assigned_service(db: Session, assigned: AssignedServiceCreate):
    db_assigned = AssignedService(**assigned.dict())
    db.add(db_assigned)
    db.commit()
    db.refresh(db_assigned)
    return db_assigned

def get_assigned_services(db: Session, skip: int = 0, limit: int = 100):
    # Simplified version to avoid complex joins that might cause issues
    return db.query(AssignedService).offset(skip).limit(limit).all()

def update_assigned_service_status(db: Session, assigned_id: int, update_data: AssignedServiceUpdate):
    assigned = db.query(AssignedService).filter(AssignedService.id == assigned_id).first()
    if assigned:
        assigned.status = update_data.status
        db.commit()
        db.refresh(assigned)
        return assigned
    return None

def delete_assigned_service(db: Session, assigned_id: int):
    assigned = db.query(AssignedService).filter(AssignedService.id == assigned_id).first()
    if assigned:
        db.delete(assigned)
        db.commit()
        return True
    return False
