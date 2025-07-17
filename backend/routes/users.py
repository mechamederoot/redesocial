"""
Rotas para gerenciamento de usuários
"""
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import uuid
import os
from pathlib import Path

from core.database import get_db
from core.config import settings
from models.user import User, UserUpdate, UserResponse
from models.post import Post
from utils.auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Obter perfil do usuário atual"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar perfil do usuário atual"""
    try:
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(current_user, field, value)
        
        current_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_user)
        
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar perfil: {str(e)}")

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter perfil de um usuário"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return user

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de avatar do usuário"""
    try:
        # Validar tipo de arquivo
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
        
        # Criar diretório se não existe
        upload_dir = Path(settings.UPLOAD_DIR) / "image"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Gerar nome único
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"avatar_{current_user.id}_{uuid.uuid4()}.{file_extension}"
        
        # Salvar arquivo
        file_path = upload_dir / unique_filename
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Atualizar usuário
        avatar_url = f"/uploads/image/{unique_filename}"
        current_user.avatar = avatar_url
        current_user.updated_at = datetime.utcnow()
        
        # Criar post sobre atualização de avatar
        profile_post = Post(
            author_id=current_user.id,
            content="atualizou a foto do perfil",
            post_type="post",
            media_type="photo",
            media_url=avatar_url,
            privacy="public",
            is_profile_update=True,
            created_at=datetime.utcnow()
        )
        db.add(profile_post)
        db.commit()
        
        return {
            "message": "Avatar atualizado com sucesso",
            "avatar_url": avatar_url
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload do avatar: {str(e)}")

@router.post("/me/cover")
async def upload_cover_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de foto de capa"""
    try:
        # Validar tipo de arquivo
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
        
        # Criar diretório se não existe
        upload_dir = Path(settings.UPLOAD_DIR) / "image"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Gerar nome único
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"cover_{current_user.id}_{uuid.uuid4()}.{file_extension}"
        
        # Salvar arquivo
        file_path = upload_dir / unique_filename
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Atualizar usuário
        cover_url = f"/uploads/image/{unique_filename}"
        current_user.cover_photo = cover_url
        current_user.updated_at = datetime.utcnow()
        
        # Criar post sobre atualização de capa
        cover_post = Post(
            author_id=current_user.id,
            content="atualizou a foto de capa",
            post_type="post",
            media_type="photo",
            media_url=cover_url,
            privacy="public",
            is_cover_update=True,
            created_at=datetime.utcnow()
        )
        db.add(cover_post)
        db.commit()
        
        return {
            "message": "Foto de capa atualizada com sucesso",
            "cover_photo_url": cover_url
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da capa: {str(e)}")

@router.get("/search")
async def search_users(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Buscar usuários"""
    if len(q) < 2:
        return []
    
    users = db.query(User).filter(
        or_(
            User.first_name.ilike(f"%{q}%"),
            User.last_name.ilike(f"%{q}%"),
            User.username.ilike(f"%{q}%"),
            User.email.ilike(f"%{q}%")
        )
    ).limit(20).all()
    
    return users
