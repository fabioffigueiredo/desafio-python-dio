from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class Conta(BaseModel):
    """Modelo para Conta Bancária"""
    __tablename__ = "contas"
    
    numero = Column(String(20), unique=True, index=True, nullable=False)
    agencia = Column(String(10), nullable=False, default="0001")
    saldo = Column(Numeric(15, 2), nullable=False, default=0.00)
    tipo_conta = Column(String(20), nullable=False, default="corrente")
    ativa = Column(Boolean, default=True, nullable=False)
    
    # Chave estrangeira
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    
    # Relacionamentos
    cliente = relationship("Cliente", back_populates="contas")
    transacoes = relationship("Transacao", back_populates="conta", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conta(numero={self.numero}, saldo={self.saldo})>"

class ContaCorrente(Conta):
    """Modelo para Conta Corrente com limite"""
    __tablename__ = "contas_corrente"
    
    id = Column(Integer, ForeignKey("contas.id"), primary_key=True)
    limite = Column(Numeric(10, 2), nullable=False, default=500.00)
    limite_saques = Column(Integer, nullable=False, default=3)
    saques_realizados = Column(Integer, nullable=False, default=0)
    
    __mapper_args__ = {
        'polymorphic_identity': 'corrente',
    }
    
    def __repr__(self):
        return f"<ContaCorrente(numero={self.numero}, limite={self.limite})>"