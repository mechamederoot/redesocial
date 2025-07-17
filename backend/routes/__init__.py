"""
Inicialização dos roteadores
"""
from .auth import router as auth_router
from .users import router as users_router
from .posts import router as posts_router
from .comments import router as comments_router

# Import outros roteadores conforme necessário
try:
    from .reactions import router as reactions_router
except ImportError:
    reactions_router = None

try:
    from .notifications import router as notifications_router
except ImportError:
    notifications_router = None

try:
    from .friendships import router as friendship_router
except ImportError:
    friendship_router = None

try:
    from .search import router as search_router
except ImportError:
    search_router = None

try:
    from .upload import router as upload_router
except ImportError:
    upload_router = None

__all__ = [
    "auth_router",
    "users_router", 
    "posts_router",
    "comments_router",
    "reactions_router",
    "notifications_router",
    "friendship_router",
    "search_router",
    "upload_router"
]
