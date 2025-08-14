from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models import Cliente, Conta, ContaCorrente
from ..schemas import (
    ContaCreate,
    ContaResponse,
    ContaCorrenteResponse,
    ContaWithTransacoes,
    SaldoResponse
)
from ..auth.dependencies import get_current_user, get_current_active_user

router = APIRouter(prefix="/contas", tags=["Contas"])

@router.post("/", response_model=ContaResponse)
async def criar_conta(
    conta_data: ContaCreate,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma nova conta para o cliente autenticado.
    Um cliente pode ter múltiplas contas do mesmo tipo.
    """
    
    # Gerar número único da conta
    numero_conta = str(uuid.uuid4().int)[:10]
    
    try:
        if conta_data.tipo_conta == "corrente":
            # Criar conta corrente
            new_conta = ContaCorrente(
                numero=numero_conta,
                agencia="0001",
                saldo=0.0,
                tipo_conta="corrente",
                cliente_id=current_user.id,
                limite=conta_data.limite or 500.0,
                limite_saques=3,
                saques_realizados=0,
                ativa=True
            )
        else:
            # Criar conta poupança
            new_conta = Conta(
                numero=numero_conta,
                agencia="0001",
                saldo=0.0,
                tipo_conta="poupanca",
                cliente_id=current_user.id,
                ativa=True
            )
        
        db.add(new_conta)
        db.commit()
        db.refresh(new_conta)
        
        return new_conta
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar conta"
        )

@router.get("/test-auth")
async def test_auth(
    current_user: Cliente = Depends(get_current_user)
):
    """Endpoint de teste para verificar autenticação"""
    return {"message": "Autenticação funcionando!", "user": current_user.nome}

@router.get("/", response_model=List[ContaResponse])
async def listar_contas(
    current_user: Cliente = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas as contas do cliente autenticado.
    """
    contas = db.query(Conta).filter(
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).all()
    
    return contas

@router.get("/{conta_numero}", response_model=ContaWithTransacoes)
async def obter_conta(
    conta_numero: str,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém detalhes de uma conta específica com suas transações.
    """
    conta = db.query(Conta).filter(
        Conta.numero == conta_numero,
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).first()
    
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    return conta

@router.get("/{conta_numero}/saldo", response_model=SaldoResponse)
async def consultar_saldo(
    conta_numero: str,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Consulta o saldo de uma conta específica.
    """
    conta = db.query(Conta).filter(
        Conta.numero == conta_numero,
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).first()
    
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    # Calcular saldo disponível
    saldo_disponivel = conta.saldo
    limite = None
    
    if isinstance(conta, ContaCorrente):
        limite = conta.limite
        saldo_disponivel = conta.saldo + conta.limite
    
    return SaldoResponse(
        conta_numero=conta.numero,
        saldo_atual=conta.saldo,
        saldo_disponivel=saldo_disponivel,
        limite=limite
    )

@router.patch("/{conta_numero}/toggle-status")
async def toggle_conta_status(
    conta_numero: str,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Alterna o status da conta (ativa/inativa).
    """
    conta = db.query(Conta).filter(
        Conta.numero == conta_numero,
        Conta.cliente_id == current_user.id
    ).first()
    
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    # Se está tentando desativar, verificar se há saldo
    if conta.ativa and conta.saldo != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desativar conta com saldo diferente de zero"
        )
    
    try:
        conta.ativa = not conta.ativa
        db.commit()
        
        status_msg = "ativada" if conta.ativa else "desativada"
        return {"message": f"Conta {status_msg} com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao alterar status da conta"
        )

@router.delete("/{conta_numero}")
async def desativar_conta(
    conta_numero: str,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Desativa uma conta (não remove do banco, apenas marca como inativa).
    """
    conta = db.query(Conta).filter(
        Conta.numero == conta_numero,
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).first()
    
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    # Verificar se há saldo na conta
    if conta.saldo != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desativar conta com saldo diferente de zero"
        )
    
    try:
        conta.ativa = False
        db.commit()
        
        return {"message": "Conta desativada com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao desativar conta"
        )