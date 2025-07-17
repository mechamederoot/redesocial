"""
Modelo de Comment
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from .base import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"))  # For replies
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    author = relationship("User", backref="comments")
    replies = relationship("Comment", backref="parent", remote_side=[id])

# Pydantic models
class CommentBase(BaseModel):
    content: str
    post_id: int
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
