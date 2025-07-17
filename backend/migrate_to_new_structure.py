#!/usr/bin/env python3
"""
Script para migrar da estrutura antiga para a nova estrutura modular
"""
import os
import shutil
from pathlib import Path

def backup_old_files():
    """Fazer backup dos arquivos antigos"""
    print("🔄 Fazendo backup dos arquivos antigos...")
    
    # Backup do main.py
    if os.path.exists("main.py"):
        shutil.copy2("main.py", "main_backup.py")
        print("✅ Backup de main.py criado como main_backup.py")
    
    # Criar pasta de backup para scripts antigos
    backup_dir = Path("backup_old_structure")
    backup_dir.mkdir(exist_ok=True)
    
    print("✅ Backup concluído")

def activate_new_structure():
    """Ativar a nova estrutura"""
    print("🚀 Ativando nova estrutura...")
    
    # Renomear main_new.py para main.py
    if os.path.exists("main_new.py"):
        if os.path.exists("main.py"):
            shutil.move("main.py", "main_legacy.py")
        shutil.move("main_new.py", "main.py")
        print("✅ main_new.py ativado como main.py")
    
    print("✅ Nova estrutura ativada!")

def verify_structure():
    """Verificar se a nova estrutura está funcionando"""
    print("🔍 Verificando nova estrutura...")
    
    required_files = [
        "core/config.py",
        "core/database.py", 
        "core/app.py",
        "models/__init__.py",
        "routes/__init__.py",
        "main.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Arquivos faltando: {missing_files}")
        return False
    
    # Testar importações
    try:
        from core.config import settings
        from core.database import get_db
        from core.app import create_app
        print("✅ Importações OK")
        
        # Testar criação da app
        app = create_app()
        print("✅ Aplicação criada com sucesso")
        
        return True
    except Exception as e:
        print(f"❌ Erro nas importações: {e}")
        return False

def main():
    """Função principal de migração"""
    print("🔧 Iniciando migração para nova estrutura modular...")
    print("=" * 50)
    
    # 1. Backup
    backup_old_files()
    print()
    
    # 2. Verificar estrutura
    if not verify_structure():
        print("❌ Estrutura não está pronta. Verifique os arquivos.")
        return False
    print()
    
    # 3. Confirmar migração
    response = input("🤔 Ativar nova estrutura? (y/N): ").strip().lower()
    if response != 'y':
        print("⏹️ Migração cancelada.")
        return False
    print()
    
    # 4. Ativar nova estrutura
    activate_new_structure()
    print()
    
    # 5. Verificação final
    print("🧪 Teste final...")
    if verify_structure():
        print("🎉 Migração concluída com sucesso!")
        print("\nPara testar:")
        print("python main.py")
        return True
    else:
        print("❌ Falha na verificação final.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
