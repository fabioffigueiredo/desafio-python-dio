from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class Transacao(BaseModel):
    """Modelo para Transações Bancárias"""
    __tablename__ = "transacoes"
    
    tipo = Column(String(20), nullable=False)  # 'saque', 'deposito', 'transferencia'
    valor = Column(Numeric(15, 2), nullable=False)
    descricao = Column(Text, nullable=True)
    saldo_anterior = Column(Numeric(15, 2), nullable=False)
    saldo_posterior = Column(Numeric(15, 2), nullable=False)
    
    # Chave estrangeira
    conta_id = Column(Integer, ForeignKey("contas.id"), nullable=False)
    
    # Relacionamentos
    conta = relationship("Conta", back_populates="transacoes")
    
    def __repr__(self):
        return f"<Transacao(tipo={self.tipo}, valor={self.valor}, conta_id={self.conta_id})>"

class Saque(Transacao):
    """Modelo específico para Saques"""
    __tablename__ = "saques"
    
    id = Column(Integer, ForeignKey("transacoes.id"), primary_key=True)
    taxa = Column(Numeric(5, 2), nullable=False, default=0.00)
    
    __mapper_args__ = {
        'polymorphic_identity': 'saque',
    }

class Deposito(Transacao):
    """Modelo específico para Depósitos"""
    __tablename__ = "depositos"
    
    id = Column(Integer, ForeignKey("transacoes.id"), primary_key=True)
    origem = Column(String(50), nullable=True)  # 'caixa', 'transferencia', etc.
    
    __mapper_args__ = {
        'polymorphic_identity': 'deposito',
    }