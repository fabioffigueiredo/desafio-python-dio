import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base

# URL de conexão com o banco
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://banco_user:banco_pass@localhost:3306/banco_dio"
)

# Configuração do engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log das queries SQL
    pool_pre_ping=True,  # Verificar conexão antes de usar
    pool_recycle=300,  # Reciclar conexões a cada 5 minutos
)

# Configuração da sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Criar todas as tabelas no banco de dados"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()