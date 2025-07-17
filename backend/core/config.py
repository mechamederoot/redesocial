"""
Core configuration for the backend application
"""
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database configuration
def get_database_url():
    """Create database URL from environment variables"""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "Evo@000#!")
    db_name = os.getenv("DB_NAME", "vibe")

    # URL encode the password to handle special characters
    encoded_password = quote_plus(db_password)
    return f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"

SQLALCHEMY_DATABASE_URL = get_database_url()

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

# Upload settings
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE_MB = 100
MAX_AVATAR_SIZE_MB = 5
MAX_COVER_SIZE_MB = 10

# Story settings
MAX_STORY_DURATION_HOURS = 24
MAX_VIDEO_STORY_SECONDS = 25
