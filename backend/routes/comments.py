"""
Rotas para comentários
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List

from core.database import get_db
from models.user import User
from models.comment import Comment, CommentCreate, CommentResponse
from utils.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar um comentário"""
    try:
        db_comment = Comment(
            author_id=current_user.id,
            post_id=comment.post_id,
            content=comment.content,
            parent_id=comment.parent_id,
            created_at=datetime.utcnow()
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        
        return db_comment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar comentário: {str(e)}")

@router.get("/post/{post_id}")
async def get_post_comments(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter comentários de um post"""
    comments = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_id.is_(None)  # Only root comments
    ).order_by(desc(Comment.created_at)).all()
    
    return comments

@router.get("/{comment_id}/replies")
async def get_comment_replies(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter respostas de um comentário"""
    replies = db.query(Comment).filter(
        Comment.parent_id == comment_id
    ).order_by(Comment.created_at).all()
    
    return replies

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar um comentário"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.author_id == current_user.id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    
    try:
        db.delete(comment)
        db.commit()
        return {"message": "Comentário deletado com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar comentário: {str(e)}")
