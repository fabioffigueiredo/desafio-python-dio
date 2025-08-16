from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal
from typing import Optional

class TransacaoBase(BaseModel):
    """Schema base para Transação"""
    tipo: str = Field(..., description="Tipo da transação")
    valor: Decimal = Field(..., gt=0, description="Valor da transação")
    descricao: Optional[str] = Field(None, description="Descrição da transação")
    
    @validator('tipo')
    def validate_tipo(cls, v):
        if v not in ['saque', 'deposito', 'transferencia', 'pix']:
            raise ValueError('Tipo deve ser "saque", "deposito", "transferencia" ou "pix"')
        return v

class SaqueRequest(BaseModel):
    """Schema para solicitação de saque"""
    valor: Decimal = Field(..., gt=0, description="Valor do saque")
    descricao: Optional[str] = Field(None, description="Descrição do saque")
    
    @validator('valor')
    def validate_valor_saque(cls, v):
        if v > Decimal('5000.00'):
            raise ValueError('Valor máximo para saque é R$ 5.000,00')
        return v

class DepositoRequest(BaseModel):
    """Schema para solicitação de depósito"""
    valor: Decimal = Field(..., gt=0, description="Valor do depósito")
    origem: Optional[str] = Field(default="caixa", description="Origem do depósito")
    descricao: Optional[str] = Field(None, description="Descrição do depósito")
    
    @validator('valor')
    def validate_valor_deposito(cls, v):
        if v > Decimal('50000.00'):
            raise ValueError('Valor máximo para depósito é R$ 50.000,00')
        return v

class TransferenciaRequest(BaseModel):
    """Schema para solicitação de transferência"""
    conta_destino: str = Field(..., description="Número da conta de destino")
    valor: Decimal = Field(..., gt=0, description="Valor da transferência")
    descricao: Optional[str] = Field(None, description="Descrição da transferência")
    
    @validator('valor')
    def validate_valor_transferencia(cls, v):
        if v > Decimal('10000.00'):
            raise ValueError('Valor máximo para transferência é R$ 10.000,00')
        return v

class TransferenciaValidationResponse(BaseModel):
    """Schema para resposta de validação de transferência"""
    conta_destino: str = Field(..., description="Número da conta de destino")
    beneficiario_nome: str = Field(..., description="Nome do beneficiário")
    beneficiario_cpf: str = Field(..., description="CPF do beneficiário")
    valor: Decimal = Field(..., description="Valor da transferência")
    saldo_disponivel: Decimal = Field(..., description="Saldo disponível na conta origem")
    taxa: Decimal = Field(default=Decimal('0.00'), description="Taxa da transferência")
    valor_total: Decimal = Field(..., description="Valor total com taxas")
    
    class Config:
        from_attributes = True

class TransacaoResponse(TransacaoBase):
    """Schema para resposta de transação"""
    id: int
    saldo_anterior: Decimal
    saldo_posterior: Decimal
    conta_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExtratoRequest(BaseModel):
    """Schema para solicitação de extrato"""
    data_inicio: Optional[datetime] = Field(None, description="Data de início")
    data_fim: Optional[datetime] = Field(None, description="Data de fim")
    tipo_transacao: Optional[str] = Field(None, description="Filtrar por tipo")
    
    @validator('tipo_transacao')
    def validate_tipo_filtro(cls, v):
        if v and v not in ['saque', 'deposito', 'transferencia', 'pix']:
            raise ValueError('Tipo deve ser "saque", "deposito", "transferencia" ou "pix"')
        return v

class ExtratoResponse(BaseModel):
    """Schema para resposta de extrato"""
    conta_numero: str
    saldo_atual: Decimal
    periodo_inicio: datetime
    periodo_fim: datetime
    transacoes: list[TransacaoResponse]
    total_saques: Decimal
    total_depositos: Decimal
    quantidade_transacoes: int