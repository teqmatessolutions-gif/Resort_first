from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate

def create_expense(db: Session, data: ExpenseCreate, image_path: str = None):
    new_expense = Expense(**data, image=image_path)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

def get_all_expenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Expense).offset(skip).limit(limit).all()

def get_expense_by_id(db: Session, expense_id: int):
    return db.query(Expense).filter(Expense.id == expense_id).first()

def update_expense(db: Session, expense_id: int, data: ExpenseUpdate):
    expense = get_expense_by_id(db, expense_id)
    for field, value in data.dict(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    return expense

def delete_expense(db: Session, expense_id: int):
    expense = get_expense_by_id(db, expense_id)
    db.delete(expense)
    db.commit()
