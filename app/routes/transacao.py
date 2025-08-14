from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List

from ..database import get_db
from ..models import Cliente, Conta, ContaCorrente, Transacao, Saque, Deposito
from ..schemas import (
    SaqueRequest,
    DepositoRequest,
    TransferenciaRequest,
    TransferenciaValidationResponse,
    TransacaoResponse,
    ExtratoRequest,
    ExtratoResponse
)
from ..auth import get_current_active_user

router = APIRouter(prefix="/transacoes", tags=["Transações"])

@router.post("/{conta_numero}/saque", response_model=TransacaoResponse)
async def realizar_saque(
    conta_numero: str,
    saque_data: SaqueRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Realiza um saque na conta especificada.
    """
    # Buscar conta
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
    
    # Verificar se é conta corrente para validações específicas
    if isinstance(conta, ContaCorrente):
        # Verificar limite de saques diários
        if conta.saques_realizados >= conta.limite_saques:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Limite de {conta.limite_saques} saques diários excedido"
            )
        
        # Verificar saldo + limite
        saldo_disponivel = conta.saldo + conta.limite
    else:
        # Conta poupança - apenas saldo
        saldo_disponivel = conta.saldo
    
    if saque_data.valor > saldo_disponivel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente"
        )
    
    try:
        # Registrar transação
        saldo_anterior = conta.saldo
        conta.saldo -= saque_data.valor
        
        # Atualizar contador de saques se for conta corrente
        if isinstance(conta, ContaCorrente):
            conta.saques_realizados += 1
        
        # Criar registro de saque
        saque = Saque(
            tipo="saque",
            valor=saque_data.valor,
            descricao=saque_data.descricao or "Saque em conta",
            saldo_anterior=saldo_anterior,
            saldo_posterior=conta.saldo,
            conta_id=conta.id,
            taxa=Decimal('2.50')  # Taxa fixa de saque
        )
        
        db.add(saque)
        db.commit()
        db.refresh(saque)
        
        return saque
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar saque"
        )

@router.post("/{conta_numero}/deposito", response_model=TransacaoResponse)
async def realizar_deposito(
    conta_numero: str,
    deposito_data: DepositoRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Realiza um depósito na conta especificada.
    """
    # Buscar conta
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
    
    try:
        # Registrar transação
        saldo_anterior = conta.saldo
        conta.saldo += deposito_data.valor
        
        # Criar registro de depósito
        deposito = Deposito(
            tipo="deposito",
            valor=deposito_data.valor,
            descricao=deposito_data.descricao or "Depósito em conta",
            saldo_anterior=saldo_anterior,
            saldo_posterior=conta.saldo,
            conta_id=conta.id,
            origem=deposito_data.origem
        )
        
        db.add(deposito)
        db.commit()
        db.refresh(deposito)
        
        return deposito
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar depósito"
        )

@router.post("/{conta_numero}/transferencia/validar", response_model=TransferenciaValidationResponse)
async def validar_transferencia(
    conta_numero: str,
    transferencia_data: TransferenciaRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Valida uma transferência e retorna informações do beneficiário.
    """
    # Buscar conta origem
    conta_origem = db.query(Conta).filter(
        Conta.numero == conta_numero,
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).first()
    
    if not conta_origem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta de origem não encontrada"
        )
    
    # Buscar conta destino
    conta_destino = db.query(Conta).filter(
        Conta.numero == transferencia_data.conta_destino,
        Conta.ativa == True
    ).first()
    
    if not conta_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta de destino não encontrada"
        )
    
    # Verificar se não é a mesma conta
    if conta_origem.id == conta_destino.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível transferir para a mesma conta"
        )
    
    # Calcular saldo disponível
    if isinstance(conta_origem, ContaCorrente):
        saldo_disponivel = conta_origem.saldo + conta_origem.limite
    else:
        saldo_disponivel = conta_origem.saldo
    
    # Verificar se há saldo suficiente
    if transferencia_data.valor > saldo_disponivel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente para realizar a transferência"
        )
    
    # Buscar informações do beneficiário
    beneficiario = db.query(Cliente).filter(
        Cliente.id == conta_destino.cliente_id
    ).first()
    
    # Calcular taxa (por enquanto zero)
    taxa = Decimal('0.00')
    valor_total = transferencia_data.valor + taxa
    
    return TransferenciaValidationResponse(
        conta_destino=transferencia_data.conta_destino,
        beneficiario_nome=beneficiario.nome,
        beneficiario_cpf=beneficiario.cpf,
        valor=transferencia_data.valor,
        saldo_disponivel=saldo_disponivel,
        taxa=taxa,
        valor_total=valor_total
    )

@router.post("/{conta_numero}/transferencia", response_model=TransacaoResponse)
async def realizar_transferencia(
    conta_numero: str,
    transferencia_data: TransferenciaRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Realiza uma transferência entre contas.
    """
    # Buscar conta origem
    conta_origem = db.query(Conta).filter(
        Conta.numero == conta_numero,
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).first()
    
    if not conta_origem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta de origem não encontrada"
        )
    
    # Buscar conta destino
    conta_destino = db.query(Conta).filter(
        Conta.numero == transferencia_data.conta_destino,
        Conta.ativa == True
    ).first()
    
    if not conta_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta de destino não encontrada"
        )
    
    # Verificar se não é a mesma conta
    if conta_origem.id == conta_destino.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível transferir para a mesma conta"
        )
    
    # Verificar saldo
    if isinstance(conta_origem, ContaCorrente):
        saldo_disponivel = conta_origem.saldo + conta_origem.limite
    else:
        saldo_disponivel = conta_origem.saldo
    
    if transferencia_data.valor > saldo_disponivel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente"
        )
    
    try:
        # Buscar informações dos clientes para incluir nomes nas descrições
        cliente_origem = db.query(Cliente).filter(Cliente.id == conta_origem.cliente_id).first()
        cliente_destino = db.query(Cliente).filter(Cliente.id == conta_destino.cliente_id).first()
        
        # Processar transferência
        saldo_anterior_origem = conta_origem.saldo
        saldo_anterior_destino = conta_destino.saldo
        
        conta_origem.saldo -= transferencia_data.valor
        conta_destino.saldo += transferencia_data.valor
        
        # Criar transação de débito (origem)
        descricao_origem = f"Transferência para {cliente_destino.nome} - Conta {conta_destino.numero}"
        if transferencia_data.descricao:
            descricao_origem += f": {transferencia_data.descricao}"
            
        transacao_origem = Transacao(
            tipo="transferencia",
            valor=transferencia_data.valor,
            descricao=descricao_origem,
            saldo_anterior=saldo_anterior_origem,
            saldo_posterior=conta_origem.saldo,
            conta_id=conta_origem.id
        )
        
        # Criar transação de crédito (destino)
        descricao_destino = f"Transferência recebida de {cliente_origem.nome} - Conta {conta_origem.numero}"
        if transferencia_data.descricao:
            descricao_destino += f": {transferencia_data.descricao}"
            
        transacao_destino = Transacao(
            tipo="transferencia",
            valor=transferencia_data.valor,
            descricao=descricao_destino,
            saldo_anterior=saldo_anterior_destino,
            saldo_posterior=conta_destino.saldo,
            conta_id=conta_destino.id
        )
        
        db.add(transacao_origem)
        db.add(transacao_destino)
        db.commit()
        db.refresh(transacao_origem)
        
        return transacao_origem
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar transferência"
        )

@router.get("/{conta_numero}/extrato", response_model=ExtratoResponse)
async def obter_extrato(
    conta_numero: str,
    extrato_params: ExtratoRequest = Depends(),
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém o extrato de uma conta com filtros opcionais.
    """
    # Buscar conta
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
    
    # Definir período padrão (últimos 30 dias)
    data_fim = extrato_params.data_fim or datetime.now()
    data_inicio = extrato_params.data_inicio or (data_fim - timedelta(days=30))
    
    # Construir query de transações
    query = db.query(Transacao).filter(
        Transacao.conta_id == conta.id,
        Transacao.created_at >= data_inicio,
        Transacao.created_at <= data_fim
    )
    
    # Aplicar filtro de tipo se especificado
    if extrato_params.tipo_transacao:
        query = query.filter(Transacao.tipo == extrato_params.tipo_transacao)
    
    # Ordenar por data (mais recente primeiro)
    transacoes = query.order_by(Transacao.created_at.desc()).all()
    
    # Calcular totais
    total_saques = sum(
        t.valor for t in transacoes 
        if t.tipo == "saque" or (t.tipo == "transferencia" and t.valor < 0)
    )
    total_depositos = sum(
        t.valor for t in transacoes 
        if t.tipo == "deposito" or (t.tipo == "transferencia" and t.valor > 0)
    )
    
    return ExtratoResponse(
        conta_numero=conta.numero,
        saldo_atual=conta.saldo,
        periodo_inicio=data_inicio,
        periodo_fim=data_fim,
        transacoes=transacoes,
        total_saques=total_saques,
        total_depositos=total_depositos,
        quantidade_transacoes=len(transacoes)
    )