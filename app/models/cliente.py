from sqlalchemy import Column, String, Date, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class Cliente(BaseModel):
    """Modelo para Cliente/Pessoa Física"""
    __tablename__ = "clientes"
    
    cpf = Column(String(11), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    endereco = Column(String(200), nullable=False)
    senha_hash = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)
    
    # Relacionamentos
    contas = relationship("Conta", back_populates="cliente", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Cliente(cpf={self.cpf}, nome={self.nome})>"