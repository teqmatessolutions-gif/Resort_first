from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import SessionLocal
from app.schemas.auth import LoginRequest, Token
from app.utils import auth
from app.curd import user as crud_user
from fastapi import Depends
from app.utils.auth import get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(auth.get_db)):
  
    user = crud_user.authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = auth.create_access_token(
        data={"user_id": user.id, "role": user.role.name},
        expires_delta=timedelta(hours=auth.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token}


@router.get("/admin-only")
def admin_data(user=Depends(get_current_user)):
    if user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"message": "Admin access granted"}



