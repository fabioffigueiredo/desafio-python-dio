from pydantic import BaseModel, Field, validator
from datetime import date
from app.auth.security import validate_cpf

class LoginRequest(BaseModel):
    """Schema para login"""
    cpf: str = Field(..., description="CPF do cliente")
    senha: str = Field(..., min_length=6, description="Senha do cliente")
    
    @validator('cpf')
    def validate_cpf_format(cls, v):
        if not validate_cpf(v):
            raise ValueError('CPF inválido')
        return ''.join(filter(str.isdigit, v))  # Remove formatação

class LoginResponse(BaseModel):
    """Schema para resposta do login"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutos

class RegisterRequest(BaseModel):
    """Schema para cadastro de cliente"""
    cpf: str = Field(..., description="CPF do cliente")
    nome: str = Field(..., min_length=2, max_length=100, description="Nome completo")
    data_nascimento: date = Field(..., description="Data de nascimento")
    endereco: str = Field(..., min_length=10, max_length=200, description="Endereço completo")
    senha: str = Field(..., min_length=6, description="Senha")
    confirmar_senha: str = Field(..., min_length=6, description="Confirmação da senha")
    
    @validator('cpf')
    def validate_cpf_format(cls, v):
        if not validate_cpf(v):
            raise ValueError('CPF inválido')
        return ''.join(filter(str.isdigit, v))
    
    @validator('confirmar_senha')
    def passwords_match(cls, v, values):
        if 'senha' in values and v != values['senha']:
            raise ValueError('Senhas não coincidem')
        return v
    
    @validator('data_nascimento')
    def validate_age(cls, v):
        from datetime import date
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError('Cliente deve ser maior de idade')
        return v

class RegisterResponse(BaseModel):
    """Schema para resposta do cadastro"""
    message: str
    cliente_id: int
    cpf: str