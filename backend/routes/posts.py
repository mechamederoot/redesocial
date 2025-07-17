"""
Rotas para posts e feed
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
from datetime import datetime
from typing import List, Optional

from core.database import get_db
from models.user import User
from models.post import Post, PostCreate, PostResponse
from models.friendship import Friendship
from utils.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar um novo post"""
    try:
        db_post = Post(
            author_id=current_user.id,
            content=post.content,
            post_type=post.post_type,
            media_type=post.media_type,
            media_url=post.media_url,
            privacy=post.privacy,
            created_at=datetime.utcnow()
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        
        return db_post
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar post: {str(e)}")

@router.get("/feed")
async def get_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0)
):
    """Obter feed do usuário"""
    try:
        # Get IDs of friends
        friend_ids_query = db.query(Friendship.friend_id).filter(
            and_(
                Friendship.user_id == current_user.id,
                Friendship.status == "accepted"
            )
        ).union(
            db.query(Friendship.user_id).filter(
                and_(
                    Friendship.friend_id == current_user.id,
                    Friendship.status == "accepted"
                )
            )
        ).subquery()
        
        # Get posts from friends and own posts
        posts = db.query(Post).filter(
            or_(
                Post.author_id == current_user.id,
                Post.author_id.in_(friend_ids_query)
            )
        ).order_by(desc(Post.created_at)).offset(offset).limit(limit).all()
        
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar feed: {str(e)}")

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter um post específico"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar um post"""
    post = db.query(Post).filter(
        and_(Post.id == post_id, Post.author_id == current_user.id)
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    try:
        db.delete(post)
        db.commit()
        return {"message": "Post deletado com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar post: {str(e)}")

@router.get("/user/{user_id}")
async def get_user_posts(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0)
):
    """Obter posts de um usuário específico"""
    posts = db.query(Post).filter(
        Post.author_id == user_id
    ).order_by(desc(Post.created_at)).offset(offset).limit(limit).all()
    
    return posts
