from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional

class ClienteBase(BaseModel):
    """Schema base para Cliente"""
    cpf: str = Field(..., description="CPF do cliente")
    nome: str = Field(..., description="Nome completo")
    data_nascimento: date = Field(..., description="Data de nascimento")
    endereco: str = Field(..., description="Endereço completo")

class ClienteCreate(ClienteBase):
    """Schema para criação de cliente"""
    senha: str = Field(..., min_length=6, description="Senha")

class ClienteUpdate(BaseModel):
    """Schema para atualização de cliente"""
    nome: Optional[str] = Field(None, description="Nome completo")
    endereco: Optional[str] = Field(None, description="Endereço completo")
    ativo: Optional[bool] = Field(None, description="Status ativo")

class ClienteResponse(ClienteBase):
    """Schema para resposta de cliente"""
    id: int
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ClienteWithContas(ClienteResponse):
    """Schema para cliente com suas contas"""
    contas: List['ContaResponse'] = []
    
    class Config:
        from_attributes = True

# Forward reference para evitar import circular
from .conta import ContaResponse
ClienteWithContas.model_rebuild()