#!/usr/bin/env python3
"""
Migration script to fix the stories.media_url column type from VARCHAR(500) to TEXT
to support storing base64 encoded images.
"""
import pymysql
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys

def get_database_config():
    """Get database configuration from environment or use defaults"""
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'social_network')
    }

def migrate_story_media_url():
    """Migrate the stories.media_url column from VARCHAR(500) to TEXT"""
    config = get_database_config()
    
    try:
        # Create database URL
        database_url = f"mysql+pymysql://{config['user']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
        
        # Create engine and session
        engine = create_engine(database_url)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        print("Starting migration: changing stories.media_url from VARCHAR(500) to TEXT...")
        
        # Check if stories table exists
        result = session.execute(text("SHOW TABLES LIKE 'stories'"))
        if not result.fetchone():
            print("❌ Stories table not found!")
            return False
        
        # Check current column type
        result = session.execute(text("DESCRIBE stories media_url"))
        current_column = result.fetchone()
        if current_column:
            print(f"Current media_url column type: {current_column[1]}")
        
        # Alter the column type
        alter_query = "ALTER TABLE stories MODIFY COLUMN media_url TEXT"
        session.execute(text(alter_query))
        session.commit()
        
        print("✅ Successfully changed stories.media_url column to TEXT")
        
        # Verify the change
        result = session.execute(text("DESCRIBE stories media_url"))
        new_column = result.fetchone()
        if new_column:
            print(f"New media_url column type: {new_column[1]}")
        
        session.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        if 'session' in locals():
            session.rollback()
            session.close()
        return False

if __name__ == "__main__":
    print("Story Media URL Migration Script")
    print("=" * 40)
    
    success = migrate_story_media_url()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("You can now create stories with base64 encoded images.")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)
