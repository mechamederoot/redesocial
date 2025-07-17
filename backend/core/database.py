"""
Configuração do banco de dados
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from urllib.parse import quote_plus

from .config import settings

def get_database_url():
    """Create database URL from environment variables"""
    # Try URL-encoded version first
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    # Build URL from individual components (safer for special characters)
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "Evo@000#!")
    db_name = os.getenv("DB_NAME", "vibe")

    # URL encode the password to handle special characters
    encoded_password = quote_plus(db_password)
    
    return f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"

DATABASE_URL = get_database_url()

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
class Base(DeclarativeBase):
    pass

def get_db() -> Session:
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Cria todas as tabelas no banco de dados"""
    from models import *  # Import all models
    Base.metadata.create_all(bind=engine)
    
def check_database_connection():
    """Verifica conexão com o banco de dados"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Conexão com banco de dados estabelecida")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar com banco de dados: {e}")
        return False
