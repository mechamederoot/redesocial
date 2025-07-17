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
    try:
        from routes import (
            auth_router,
            users_router,
            posts_router,
            comments_router
        )

        app.include_router(auth_router, prefix="/auth", tags=["auth"])
        app.include_router(users_router, prefix="/users", tags=["users"])
        app.include_router(posts_router, prefix="/posts", tags=["posts"])
        app.include_router(comments_router, prefix="/comments", tags=["comments"])

        # Rotas opcionais (se existirem)
        try:
            from routes.reactions import router as reactions_router
            app.include_router(reactions_router, prefix="/reactions", tags=["reactions"])
        except ImportError:
            pass

        try:
            from routes.notifications import router as notifications_router
            app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
        except ImportError:
            pass

        try:
            from routes.friendships import router as friendship_router
            app.include_router(friendship_router, prefix="/friendships", tags=["friendships"])
        except ImportError:
            pass

    except ImportError as e:
        print(f"⚠️ Erro ao importar rotas: {e}")
        # Fallback para rotas básicas do main.py antigo se necessário
    
    
    
    return app
