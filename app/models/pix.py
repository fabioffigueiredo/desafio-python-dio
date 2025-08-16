from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import BaseModel

class TipoChavePix(enum.Enum):
    """Tipos de chave PIX"""
    CPF = "cpf"
    CNPJ = "cnpj"
    EMAIL = "email"
    TELEFONE = "telefone"
    ALEATORIA = "aleatoria"

class ChavePix(BaseModel):
    """Modelo para Chave PIX"""
    __tablename__ = "chaves_pix"
    
    chave = Column(String(77), unique=True, index=True, nullable=False)  # Tamanho máximo para chave aleatória
    tipo = Column(Enum(TipoChavePix), nullable=False)
    ativa = Column(Boolean, default=True, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Chave estrangeira
    conta_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    
    # Relacionamentos
    conta = relationship("Conta", backref="chaves_pix")
    
    def __repr__(self):
        return f"<ChavePix(chave={self.chave}, tipo={self.tipo.value})>"

class TransacaoPix(BaseModel):
    """Modelo para Transação PIX"""
    __tablename__ = "transacoes_pix"
    
    chave_origem = Column(String(77), nullable=False)
    chave_destino = Column(String(77), nullable=False)
    valor = Column(String(20), nullable=False)  # Valor em centavos como string
    descricao = Column(String(200), nullable=True)
    status = Column(String(20), nullable=False, default="processando")
    data_transacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Chaves estrangeiras
    conta_origem_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    conta_destino_id = Column(Integer, ForeignKey("contas.id"), nullable=True)  # Pode ser nulo se for conta externa
    
    # Relacionamentos
    conta_origem = relationship("Conta", foreign_keys=[conta_origem_id])
    conta_destino = relationship("Conta", foreign_keys=[conta_destino_id])
    
    def __repr__(self):
        return f"<TransacaoPix(chave_destino={self.chave_destino}, valor={self.valor})>"