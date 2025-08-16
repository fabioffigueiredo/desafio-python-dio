from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import re

class TipoChavePixEnum(str):
    CPF = "cpf"
    CNPJ = "cnpj"
    EMAIL = "email"
    TELEFONE = "telefone"
    ALEATORIA = "aleatoria"

class ChavePixBase(BaseModel):
    chave: str = Field(..., description="Chave PIX")
    tipo: str = Field(..., description="Tipo da chave PIX")

class ChavePixCreate(ChavePixBase):
    conta_numero: str = Field(..., description="Número da conta")
    
    @validator('tipo')
    def validate_tipo(cls, v):
        valid_types = ['cpf', 'cnpj', 'email', 'telefone', 'aleatoria']
        if v not in valid_types:
            raise ValueError(f'Tipo deve ser um dos: {valid_types}')
        return v
    
    @validator('chave')
    def validate_chave(cls, v, values):
        if 'tipo' not in values:
            return v
            
        tipo = values['tipo']
        
        if tipo == 'cpf':
            # Remove caracteres não numéricos
            cpf = re.sub(r'\D', '', v)
            if len(cpf) != 11:
                raise ValueError('CPF deve ter 11 dígitos')
            return cpf
            
        elif tipo == 'cnpj':
            # Remove caracteres não numéricos
            cnpj = re.sub(r'\D', '', v)
            if len(cnpj) != 14:
                raise ValueError('CNPJ deve ter 14 dígitos')
            return cnpj
            
        elif tipo == 'email':
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError('Email inválido')
            return v.lower()
            
        elif tipo == 'telefone':
            # Remove caracteres não numéricos
            telefone = re.sub(r'\D', '', v)
            if len(telefone) < 10 or len(telefone) > 11:
                raise ValueError('Telefone deve ter 10 ou 11 dígitos')
            return telefone
            
        elif tipo == 'aleatoria':
            # Chave aleatória deve ter formato específico
            if len(v) != 32:
                raise ValueError('Chave aleatória deve ter 32 caracteres')
            return v
            
        return v

class ChavePixResponse(ChavePixBase):
    id: int
    ativa: bool
    data_criacao: datetime
    conta_numero: str
    
    class Config:
        from_attributes = True

class ChavePixListResponse(BaseModel):
    chaves: List[ChavePixResponse]
    total: int

class PixTransferenciaRequest(BaseModel):
    chave_destino: str = Field(..., description="Chave PIX de destino")
    valor: Decimal = Field(..., gt=0, description="Valor da transferência")
    descricao: Optional[str] = Field(None, max_length=200, description="Descrição da transferência")
    
    @validator('valor')
    def validate_valor(cls, v):
        if v <= 0:
            raise ValueError('Valor deve ser maior que zero')
        if v > Decimal('50000.00'):
            raise ValueError('Valor máximo para PIX é R$ 50.000,00')
        return v

class PixValidationResponse(BaseModel):
    chave_destino: str
    beneficiario_nome: str
    beneficiario_cpf: str
    valor: Decimal
    taxa: Decimal = Decimal('0.00')
    valor_total: Decimal
    saldo_disponivel: Decimal
    
class PixTransferenciaResponse(BaseModel):
    id: int
    chave_origem: str
    chave_destino: str
    valor: Decimal
    descricao: Optional[str] = None
    status: str
    data_transacao: datetime
    
    class Config:
        from_attributes = True

class ChavePixDeleteRequest(BaseModel):
    chave: str = Field(..., description="Chave PIX a ser removida")