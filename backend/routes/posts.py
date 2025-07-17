from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from main import (
    get_db, get_current_user, User, Post, PostCreate, PostResponse, 
    Comment, Like, Share, Reaction
)
import base64
import os
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=PostResponse)
def create_post(post: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"Creating post for user {current_user.id}: {post.dict()}")
    
    # Handle base64 media data if present
    media_url = post.media_url
    if media_url and media_url.startswith('data:'):
        try:
            header, data = media_url.split(',', 1)
            file_data = base64.b64decode(data)
            
            # Create uploads directory if it doesn't exist
            os.makedirs('uploads/posts', exist_ok=True)
            
            # Generate filename
            file_extension = 'jpg' if 'image' in header else 'mp4' if 'video' in header else 'mp3'
            filename = f"post_{current_user.id}_{int(datetime.utcnow().timestamp())}.{file_extension}"
            file_path = f"uploads/posts/{filename}"
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            media_url = f"http://localhost:8000/{file_path}"
        except Exception as e:
            print(f"Error saving media file: {e}")
            media_url = None
    
    try:
                db_post = Post(
            content=post.content,
            post_type=post.post_type,
            media_type=post.media_type,
            media_url=media_url,
            media_metadata=post.media_metadata,
            privacy=post.privacy,
            author_id=current_user.id,
            is_profile_update=post.is_profile_update,
            is_cover_update=post.is_cover_update
        )
        print(f"Post object created with fields: content={post.content}, type={post.post_type}, privacy={post.privacy}")
        
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        
        print(f"Post committed with ID: {db_post.id}")
    except Exception as e:
        print(f"Error creating post: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}")
    
    # Add counts and author info
    db_post.reactions_count = db.query(Reaction).filter(Reaction.post_id == db_post.id).count()
    db_post.comments_count = db.query(Comment).filter(Comment.post_id == db_post.id).count()
    db_post.shares_count = db.query(Share).filter(Share.post_id == db_post.id).count()
    
    # Add author information for response
    db_post.author = {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "username": current_user.username,
        "avatar": current_user.avatar
    }
    
    print(f"Returning post: {db_post.id} with author: {db_post.author}")
    return db_post

@router.get("/", response_model=List[PostResponse])
def get_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add counts and author info for each post
    for post in posts:
        post.reactions_count = db.query(Reaction).filter(Reaction.post_id == post.id).count()
        post.comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        post.shares_count = db.query(Share).filter(Share.post_id == post.id).count()
        
        # Add author information
        if post.author:
            post.author = {
                "id": post.author.id,
                "first_name": post.author.first_name,
                "last_name": post.author.last_name,
                "username": post.author.username,
                "avatar": post.author.avatar
            }
    
    return posts

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Add counts and author info
    post.reactions_count = db.query(Reaction).filter(Reaction.post_id == post.id).count()
    post.comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
    post.shares_count = db.query(Share).filter(Share.post_id == post.id).count()
    
    # Add author information
    if post.author:
        post.author = {
            "id": post.author.id,
            "first_name": post.author.first_name,
            "last_name": post.author.last_name,
            "username": post.author.username,
            "avatar": post.author.avatar
        }
    
    return post

@router.delete("/{post_id}")
def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete associated file if exists
    if post.media_url and post.media_url.startswith('http://localhost:8000/uploads/'):
        file_path = post.media_url.replace('http://localhost:8000/', '')
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}

@router.get("/{post_id}/comments")
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_id == None
    ).order_by(Comment.created_at.desc()).all()
    
    # Get replies for each comment
    for comment in comments:
        comment.replies = db.query(Comment).filter(Comment.parent_id == comment.id).all()
        comment.reactions_count = 0  # Add reaction count logic if needed
    
    return comments
