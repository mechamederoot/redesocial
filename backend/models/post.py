"""
Modelo de Post
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from .base import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    post_type = Column(String(20), default="post")  # post, testimonial
    media_type = Column(String(20))  # photo, video, none
    media_url = Column(String(500))
    privacy = Column(String(20), default="public")  # public, friends, private
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    is_profile_update = Column(Boolean, default=False)
    is_cover_update = Column(Boolean, default=False)
    
    # Relationships
    author = relationship("User", backref="posts")
    comments = relationship("Comment", backref="post", cascade="all, delete-orphan")
    reactions = relationship("Reaction", backref="post", cascade="all, delete-orphan")

# Pydantic models
class PostBase(BaseModel):
    content: str
    post_type: str = "post"
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    privacy: str = "public"

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    is_profile_update: bool = False
    is_cover_update: bool = False
    
    class Config:
        from_attributes = True
