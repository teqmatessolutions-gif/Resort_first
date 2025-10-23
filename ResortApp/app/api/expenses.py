from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.curd import expenses as expense_crud
from app.utils.auth import get_db, get_current_user
from app.schemas.expenses import ExpenseOut
from app.models.user import User
from app.models.employee import Employee
import os
import shutil
from fastapi.responses import FileResponse
import uuid

router = APIRouter(prefix="/expenses", tags=["Expenses"])

UPLOAD_DIR = "uploads/expenses"


@router.post("/", response_model=ExpenseOut)
async def create_expense(
    category: str = Form(...),
    amount: float = Form(...),
    date: str = Form(...),
    description: str = Form(None),
    employee_id: int = Form(...),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_path = None
    if image:
        # Safe filename using UUID
        filename = f"{employee_id}_{uuid.uuid4().hex}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Path to be used by frontend (relative to /uploads/)
        image_path = f"uploads/expenses/{filename}"

    # Store expense in DB
    expense_data = {
        "category": category,
        "amount": amount,
        "date": date,
        "description": description,
        "employee_id": employee_id,
    }

    created = expense_crud.create_expense(db, data=expense_data, image_path=image_path)

    # Add employee name in the response
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    return {
        **created.__dict__,
        "employee_name": employee.name if employee else "N/A"
    }

@router.get("/", response_model=list[ExpenseOut])
def get_expenses(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    expenses = expense_crud.get_all_expenses(db, skip=skip, limit=limit)
    result = []
    for exp in expenses:
        emp = db.query(Employee).filter(Employee.id == exp.employee_id).first()
        result.append({
            **exp.__dict__,
            "employee_name": emp.name if emp else "N/A"
        })
    return result

@router.get("/image/{filename}")
def get_expense_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
