from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

class ContaBase(BaseModel):
    """Schema base para Conta"""
    numero: str = Field(..., description="Número da conta")
    agencia: str = Field(default="0001", description="Agência")
    tipo_conta: str = Field(default="corrente", description="Tipo da conta")

class ContaCreate(BaseModel):
    """Schema para criação de conta"""
    tipo_conta: str = Field(default="corrente", description="Tipo da conta")
    limite: Optional[Decimal] = Field(default=Decimal('500.00'), description="Limite para conta corrente")
    
    @validator('tipo_conta')
    def validate_tipo_conta(cls, v):
        if v not in ['corrente', 'poupanca']:
            raise ValueError('Tipo de conta deve ser "corrente" ou "poupanca"')
        return v

class ContaUpdate(BaseModel):
    """Schema para atualização de conta"""
    ativa: Optional[bool] = Field(None, description="Status da conta")
    limite: Optional[Decimal] = Field(None, description="Limite da conta")

class ContaResponse(ContaBase):
    """Schema para resposta de conta"""
    id: int
    saldo: Decimal
    ativa: bool
    cliente_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ContaCorrenteResponse(ContaResponse):
    """Schema para resposta de conta corrente"""
    limite: Decimal
    limite_saques: int
    saques_realizados: int
    
    class Config:
        from_attributes = True

class ContaWithTransacoes(ContaResponse):
    """Schema para conta com transações"""
    transacoes: List['TransacaoResponse'] = []
    
    class Config:
        from_attributes = True

class SaldoResponse(BaseModel):
    """Schema para consulta de saldo"""
    conta_numero: str
    saldo_atual: Decimal
    saldo_disponivel: Decimal  # Saldo + limite para conta corrente
    limite: Optional[Decimal] = None
    
# Forward reference
from .transacao import TransacaoResponse
ContaWithTransacoes.model_rebuild()