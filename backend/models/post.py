"""
Post model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    post_type = Column(String(20), default="post")
    media_type = Column(String(50))
    media_url = Column(String(500))
    media_metadata = Column(Text)
    privacy = Column(String(20), default="public")  # public, friends, private
    created_at = Column(DateTime, default=datetime.utcnow)
    reactions_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    is_profile_update = Column(Boolean, default=False)
    is_cover_update = Column(Boolean, default=False)
    
    author = relationship("User", backref="posts")
