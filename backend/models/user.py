"""
Modelo de User
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr

from .base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    display_id = Column(String(20), unique=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20))
    gender = Column(String(20))
    birth_date = Column(Date)
    bio = Column(Text)
    avatar = Column(String(500))
    cover_photo = Column(String(500))
    location = Column(String(100))
    website = Column(String(200))
    work = Column(String(100))
    education = Column(String(100))
    relationship_status = Column(String(30))
    nickname = Column(String(50))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    work: Optional[str] = None
    education: Optional[str] = None
    relationship_status: Optional[str] = None
    nickname: Optional[str] = None

class UserResponse(UserBase):
    id: int
    display_id: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    cover_photo: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    work: Optional[str] = None
    education: Optional[str] = None
    relationship_status: Optional[str] = None
    nickname: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
