"""
Aplicação principal refatorada
"""
import uvicorn
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Auto-fix database issues on startup
try:
    from maintenance.auto_fix_reactions import auto_fix_reactions_table
    auto_fix_reactions_table()
except Exception as e:
    print(f"⚠️ Could not auto-fix reactions table: {e}")

from core.app import create_app
from core.database import check_database_connection, create_tables

def main():
    """Função principal da aplicação"""
    
    # Verificar conexão com banco
    if not check_database_connection():
        print("❌ Falha ao conectar com banco de dados. Verifique as configurações.")
        return
    
    # Criar tabelas se necessário
    try:
        create_tables()
        print("✅ Tabelas do banco de dados verificadas")
    except Exception as e:
        print(f"⚠�� Aviso ao verificar tabelas: {e}")
    
    # Criar aplicação
    app = create_app()
    
    return app

# Criar instância da aplicação
app = main()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
