"""
Database connection and session management
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import SQLALCHEMY_DATABASE_URL
import os

# Create engine with MySQL optimizations
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
    pool_size=10,  # Connection pool size
    max_overflow=20,  # Maximum overflow connections
    connect_args={
        "charset": "utf8mb4",
        "use_unicode": True,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization functions
def create_database_if_not_exists():
    """Create the 'vibe' database if it doesn't exist"""
    try:
        from urllib.parse import quote_plus

        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "3306")
        db_user = os.getenv("DB_USER", "root")
        db_password = os.getenv("DB_PASSWORD", "Evo@000#!")

        # URL encode the password
        encoded_password = quote_plus(db_password)
        server_url = f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}:{db_port}/"

        server_engine = create_engine(server_url)

        with server_engine.connect() as connection:
            # Check if database exists
            result = connection.execute(text("SHOW DATABASES LIKE 'vibe'"))
            if not result.fetchone():
                print("🔧 Criando banco de dados 'vibe'...")
                connection.execute(text("CREATE DATABASE vibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                print("✅ Banco de dados 'vibe' criado com sucesso!")
            else:
                print("✅ Banco de dados 'vibe' já existe!")

    except Exception as e:
        print(f"❌ Erro ao criar banco de dados: {e}")
        raise

def initialize_database():
    """Initialize MySQL database with all required tables"""
    print("🚀 Inicializando banco de dados MySQL...")
    print("=" * 50)

    try:
        # First, ensure database exists
        create_database_if_not_exists()

        # Test database connection
        print("🔧 Testando conexão com o banco de dados...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Conexão com MySQL estabelecida com sucesso!")

        # Create all tables
        print("🔧 Criando tabelas no banco de dados 'vibe'...")
        Base.metadata.create_all(bind=engine)

        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if tables:
            print("✅ Tabelas criadas com sucesso!")
            print(f"📋 Total de tabelas: {len(tables)}")
            print("📋 Tabelas criadas:")
            for table in sorted(tables):
                print(f"   - {table}")
        else:
            print("⚠️ Nenhuma tabela foi encontrada")

        print("=" * 50)
        print("🎉 Banco de dados MySQL inicializado com sucesso!")

    except Exception as e:
        print("❌ ERRO ao inicializar banco de dados!")
        print("=" * 50)
        print(f"Erro: {str(e)}")
        print("\n💡 Verificações necessárias:")
        print("   1. MySQL Server está rodando?")
        print("   2. Banco 'vibe' existe?")
        print("   3. Credenciais estão corretas?")
        print("   4. Porta 3306 está acessível?")
        print("   5. PyMySQL está instalado? (pip install pymysql)")
        print("=" * 50)
        raise e

def init_sample_data():
    """Initialize database with sample data"""
    from models.user import User
    from models.post import Post
    from utils.auth import hash_password
    from datetime import datetime
    
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() == 0:
            # Create sample user
            sample_user = User(
                first_name="João",
                last_name="Silva",
                email="joao@exemplo.com",
                password_hash=hash_password("123456"),
                gender="M",
                is_active=True,
                created_at=datetime.utcnow(),
                last_seen=datetime.utcnow()
            )
            db.add(sample_user)
            db.commit()
            db.refresh(sample_user)
            
            # Create sample post
            sample_post = Post(
                author_id=sample_user.id,
                content="Bem-vindos à nossa rede social! 🎉",
                post_type="post",
                created_at=datetime.utcnow()
            )
            db.add(sample_post)
            db.commit()
            
            print("✅ Dados de exemplo criados com sucesso!")
            print(f"📧 Email: {sample_user.email}")
            print("🔑 Senha: 123456")
    except Exception as e:
        print(f"❌ Erro ao criar dados de exemplo: {e}")
        db.rollback()
    finally:
        db.close()
