"""
Factory para criação da aplicação FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .config import settings

def create_app() -> FastAPI:
    """Cria e configura a aplicação FastAPI"""
    
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG
    )
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Static files
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
    
    # Incluir rotas
    from routes import (
        auth_router,
        users_router,
        posts_router,
        comments_router,
        reactions_router,
        notifications_router,
        friendship_router,
        search_router,
        upload_router
    )
    
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(users_router, prefix="/users", tags=["users"])
    app.include_router(posts_router, prefix="/posts", tags=["posts"])
    app.include_router(comments_router, prefix="/comments", tags=["comments"])
    app.include_router(reactions_router, prefix="/reactions", tags=["reactions"])
    app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
    app.include_router(friendship_router, prefix="/friendships", tags=["friendships"])
    app.include_router(search_router, prefix="/search", tags=["search"])
    app.include_router(upload_router, prefix="/upload", tags=["upload"])
    
    return app
