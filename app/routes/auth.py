from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..models import Cliente
from ..schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from ..auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    validate_cpf,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica um cliente usando CPF e senha.
    """
    # Buscar cliente pelo CPF
    cliente = db.query(Cliente).filter(Cliente.cpf == login_data.cpf).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar senha
    if not verify_password(login_data.senha, cliente.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se cliente está ativo
    if not cliente.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Conta desativada. Entre em contato com o banco.",
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": cliente.cpf}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/register", response_model=RegisterResponse)
async def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registra um novo cliente no sistema.
    """
    # Verificar se CPF já existe
    existing_cliente = db.query(Cliente).filter(Cliente.cpf == register_data.cpf).first()
    if existing_cliente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado no sistema"
        )
    
    # Criar hash da senha
    password_hash = get_password_hash(register_data.senha)
    
    # Criar novo cliente
    new_cliente = Cliente(
        cpf=register_data.cpf,
        nome=register_data.nome,
        data_nascimento=register_data.data_nascimento,
        endereco=register_data.endereco,
        senha_hash=password_hash,
        ativo=True
    )
    
    try:
        db.add(new_cliente)
        db.commit()
        db.refresh(new_cliente)
        
        return RegisterResponse(
            message="Cliente cadastrado com sucesso",
            cliente_id=new_cliente.id,
            cpf=new_cliente.cpf
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor ao criar cliente"
        )

@router.delete("/delete/{cpf}")
async def delete_cliente(cpf: str, db: Session = Depends(get_db)):
    """
    Deleta um cliente pelo CPF (endpoint temporário para testes).
    """
    cliente = db.query(Cliente).filter(Cliente.cpf == cpf).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    try:
        db.delete(cliente)
        db.commit()
        return {"message": f"Cliente com CPF {cpf} deletado com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor ao deletar cliente"
        )

@router.get("/me")
async def get_current_user_info(current_user: Cliente = Depends(get_current_user)):
    """
    Retorna informações do usuário atual autenticado.
    """
    return {
        "id": current_user.id,
        "cpf": current_user.cpf,
        "nome": current_user.nome,
        "data_nascimento": current_user.data_nascimento.isoformat() if current_user.data_nascimento else None,
        "endereco": current_user.endereco,
        "ativo": current_user.ativo
    }

@router.post("/logout")
async def logout():
    """
    Endpoint para logout (token será invalidado no frontend).
    """
    return {"message": "Logout realizado com sucesso"}