"""
Auto-fix migration for stories.media_url column to support base64 images
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import quote_plus

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

def auto_fix_story_media_url():
    """Auto-fix the stories.media_url column type to TEXT"""
    try:
        # Create engine
        SQLALCHEMY_DATABASE_URL = get_database_url()
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        
        # Check if stories table exists
        result = session.execute(text("SHOW TABLES LIKE 'stories'"))
        if not result.fetchone():
            print("ℹ️ Stories table not found, skipping media_url migration")
            session.close()
            return
        
        # Check current column type
        try:
            result = session.execute(text("DESCRIBE stories media_url"))
            current_column = result.fetchone()
            
            if current_column and 'varchar' in current_column[1].lower():
                print("🔧 Fixing stories.media_url column type to support base64 images...")
                
                # Alter the column type
                session.execute(text("ALTER TABLE stories MODIFY COLUMN media_url TEXT"))
                session.commit()
                
                print("✅ Fixed stories.media_url column type to TEXT")
            else:
                print("ℹ️ Stories.media_url column already using TEXT type")
                
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                print("ℹ️ Stories.media_url column doesn't exist yet, will be created correctly")
            else:
                print(f"⚠️ Error checking/fixing stories.media_url column: {e}")
        
        session.close()
        
    except Exception as e:
        print(f"⚠️ Could not auto-fix stories.media_url column: {e}")
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    auto_fix_story_media_url()
