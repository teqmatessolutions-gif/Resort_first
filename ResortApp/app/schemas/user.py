from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr

# ---------- Role Models ----------
class RoleBase(BaseModel):
    name: str
    permissions: Optional[List[str]] = []

class RoleCreate(RoleBase):
    permissions: Optional[str] = None # Accept as string from frontend

class RoleOut(RoleBase):
    id: int
    name: str
    permissions: Optional[List[str]] = None
    model_config = ConfigDict(from_attributes=True)

# ---------- User Models ----------
class UserBase(BaseModel):
    name: str
    email: EmailStr  # Use EmailStr for email validation
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int

class AdminSetupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: RoleOut
    phone: Optional[str]
    is_active: bool
    model_config = ConfigDict(from_attributes=True)