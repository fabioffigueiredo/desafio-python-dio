from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import List
import uuid
import re

from ..database import get_db
from ..models import Cliente, Conta, ChavePix, TransacaoPix, Transacao
from ..models.pix import TipoChavePix
from ..schemas import (
    ChavePixCreate,
    ChavePixResponse,
    ChavePixListResponse,
    PixTransferenciaRequest,
    PixValidationResponse,
    PixTransferenciaResponse,
    ChavePixDeleteRequest
)
from ..auth import get_current_active_user

router = APIRouter(prefix="/pix", tags=["PIX"])

@router.post("/chaves", response_model=ChavePixResponse)
async def criar_chave_pix(
    chave_data: ChavePixCreate,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma nova chave PIX para a conta especificada.
    """
    # Buscar conta
    conta = db.query(Conta).filter(
        Conta.numero == chave_data.conta_numero,
        Conta.cliente_id == current_user.id,
        Conta.ativa == True
    ).first()
    
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    # Verificar se a chave já existe
    chave_existente = db.query(ChavePix).filter(
        ChavePix.chave == chave_data.chave,
        ChavePix.ativa == True
    ).first()
    
    if chave_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chave PIX já está em uso"
        )
    
    # Verificar limite de chaves por conta (máximo 5)
    chaves_conta = db.query(ChavePix).filter(
        ChavePix.conta_id == conta.id,
        ChavePix.ativa == True
    ).count()
    
    if chaves_conta >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limite máximo de 5 chaves PIX por conta atingido"
        )
    
    # Gerar chave aleatória se necessário
    chave_final = chave_data.chave
    if chave_data.tipo == 'aleatoria':
        chave_final = str(uuid.uuid4()).replace('-', '')
    
    # Criar chave PIX
    nova_chave = ChavePix(
        chave=chave_final,
        tipo=TipoChavePix(chave_data.tipo),
        conta_id=conta.id
    )
    
    db.add(nova_chave)
    db.commit()
    db.refresh(nova_chave)
    
    # Preparar resposta
    response = ChavePixResponse(
        id=nova_chave.id,
        chave=nova_chave.chave,
        tipo=nova_chave.tipo.value,
        ativa=nova_chave.ativa,
        data_criacao=nova_chave.data_criacao,
        conta_numero=conta.numero
    )
    
    return response

@router.get("/chaves/{conta_numero}", response_model=ChavePixListResponse)
async def listar_chaves_pix(
    conta_numero: str,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas as chaves PIX ativas de uma conta.
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
    
    # Buscar chaves PIX
    chaves = db.query(ChavePix).filter(
        ChavePix.conta_id == conta.id,
        ChavePix.ativa == True
    ).all()
    
    chaves_response = [
        ChavePixResponse(
            id=chave.id,
            chave=chave.chave,
            tipo=chave.tipo.value,
            ativa=chave.ativa,
            data_criacao=chave.data_criacao,
            conta_numero=conta.numero
        )
        for chave in chaves
    ]
    
    return ChavePixListResponse(
        chaves=chaves_response,
        total=len(chaves_response)
    )

@router.delete("/chaves")
async def remover_chave_pix(
    chave_data: ChavePixDeleteRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove uma chave PIX (desativa).
    """
    # Buscar chave PIX
    chave = db.query(ChavePix).join(Conta).filter(
        ChavePix.chave == chave_data.chave,
        ChavePix.ativa == True,
        Conta.cliente_id == current_user.id
    ).first()
    
    if not chave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chave PIX não encontrada"
        )
    
    # Desativar chave
    chave.ativa = False
    db.commit()
    
    return {"message": "Chave PIX removida com sucesso"}

@router.post("/transferencia/{conta_numero}/validar", response_model=PixValidationResponse)
async def validar_transferencia_pix(
    conta_numero: str,
    transferencia_data: PixTransferenciaRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Valida uma transferência PIX antes de executar.
    """
    # Buscar conta de origem
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
    
    # Buscar chave PIX de destino
    chave_destino = db.query(ChavePix).filter(
        ChavePix.chave == transferencia_data.chave_destino,
        ChavePix.ativa == True
    ).first()
    
    if not chave_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chave PIX de destino não encontrada"
        )
    
    # Buscar conta de destino
    conta_destino = chave_destino.conta
    
    # Verificar se não é transferência para a mesma conta
    if conta_origem.id == conta_destino.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível transferir para a mesma conta"
        )
    
    # Verificar saldo
    valor = transferencia_data.valor
    taxa = Decimal('0.00')  # PIX não tem taxa
    valor_total = valor + taxa
    
    if conta_origem.saldo < valor_total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente"
        )
    
    # Buscar dados do beneficiário
    beneficiario = conta_destino.cliente
    
    return PixValidationResponse(
        chave_destino=transferencia_data.chave_destino,
        beneficiario_nome=beneficiario.nome,
        beneficiario_cpf=beneficiario.cpf,
        valor=valor,
        taxa=taxa,
        valor_total=valor_total,
        saldo_disponivel=conta_origem.saldo
    )

@router.post("/transferencia/{conta_numero}", response_model=PixTransferenciaResponse)
async def realizar_transferencia_pix(
    conta_numero: str,
    transferencia_data: PixTransferenciaRequest,
    current_user: Cliente = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Realiza uma transferência PIX.
    """
    # Buscar conta de origem
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
    
    # Buscar chave PIX de destino
    chave_destino = db.query(ChavePix).filter(
        ChavePix.chave == transferencia_data.chave_destino,
        ChavePix.ativa == True
    ).first()
    
    if not chave_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chave PIX de destino não encontrada"
        )
    
    # Buscar conta de destino
    conta_destino = chave_destino.conta
    
    # Verificar se não é transferência para a mesma conta
    if conta_origem.id == conta_destino.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível transferir para a mesma conta"
        )
    
    # Verificar saldo
    valor = transferencia_data.valor
    if conta_origem.saldo < valor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente"
        )
    
    # Buscar chave PIX de origem (primeira chave ativa da conta)
    chave_origem = db.query(ChavePix).filter(
        ChavePix.conta_id == conta_origem.id,
        ChavePix.ativa == True
    ).first()
    
    if not chave_origem:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta de origem não possui chave PIX ativa"
        )
    
    try:
        # Buscar informações dos clientes para incluir nomes nas descrições
        cliente_origem = db.query(Cliente).filter(Cliente.id == conta_origem.cliente_id).first()
        cliente_destino = db.query(Cliente).filter(Cliente.id == conta_destino.cliente_id).first()
        
        # Processar transferência PIX
        saldo_anterior_origem = conta_origem.saldo
        saldo_anterior_destino = conta_destino.saldo
        
        conta_origem.saldo -= valor
        conta_destino.saldo += valor
        
        # Criar registro da transação PIX
        transacao_pix = TransacaoPix(
            chave_origem=chave_origem.chave,
            chave_destino=transferencia_data.chave_destino,
            valor=str(int(valor * 100)),  # Converter para centavos
            descricao=transferencia_data.descricao,
            status="concluida",
            conta_origem_id=conta_origem.id,
            conta_destino_id=conta_destino.id
        )
        
        # Criar transação de débito PIX (origem) para aparecer no extrato
        descricao_origem = f"PIX para {cliente_destino.nome} - Chave: {transferencia_data.chave_destino[:20]}..."
        if transferencia_data.descricao:
            descricao_origem += f": {transferencia_data.descricao}"
            
        transacao_origem = Transacao(
            tipo="pix",
            valor=valor,
            descricao=descricao_origem,
            saldo_anterior=saldo_anterior_origem,
            saldo_posterior=conta_origem.saldo,
            conta_id=conta_origem.id
        )
        
        # Criar transação de crédito PIX (destino) para aparecer no extrato
        descricao_destino = f"PIX recebido de {cliente_origem.nome} - Chave: {chave_origem.chave[:20]}..."
        if transferencia_data.descricao:
            descricao_destino += f": {transferencia_data.descricao}"
            
        transacao_destino = Transacao(
            tipo="pix",
            valor=valor,
            descricao=descricao_destino,
            saldo_anterior=saldo_anterior_destino,
            saldo_posterior=conta_destino.saldo,
            conta_id=conta_destino.id
        )
        
        db.add(transacao_pix)
        db.add(transacao_origem)
        db.add(transacao_destino)
        db.commit()
        db.refresh(transacao_pix)
        
        return PixTransferenciaResponse(
            id=transacao_pix.id,
            chave_origem=transacao_pix.chave_origem,
            chave_destino=transacao_pix.chave_destino,
            valor=valor,
            descricao=transacao_pix.descricao,
            status=transacao_pix.status,
            data_transacao=transacao_pix.data_transacao
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor ao processar transferência PIX"
        )