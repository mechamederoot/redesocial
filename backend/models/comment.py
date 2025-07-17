"""
Comment model
"""
from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("User", backref="comments")
    post = relationship("Post", backref="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
