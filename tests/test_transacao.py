import pytest
from fastapi import status
from decimal import Decimal

def test_realizar_deposito(client, auth_headers, sample_conta):
    """Testa realização de depósito"""
    deposito_data = {
        "valor": 500.0,
        "origem": "caixa",
        "descricao": "Depósito teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/deposito",
        json=deposito_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["tipo"] == "deposito"
    assert data["valor"] == 500.0
    assert data["saldo_anterior"] == 1000.0
    assert data["saldo_posterior"] == 1500.0
    assert data["descricao"] == "Depósito teste"

def test_realizar_saque_sucesso(client, auth_headers, sample_conta):
    """Testa realização de saque com sucesso"""
    saque_data = {
        "valor": 200.0,
        "descricao": "Saque teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/saque",
        json=saque_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["tipo"] == "saque"
    assert data["valor"] == 200.0
    assert data["saldo_anterior"] == 1000.0
    assert data["saldo_posterior"] == 800.0

def test_realizar_saque_saldo_insuficiente(client, auth_headers, sample_conta):
    """Testa saque com saldo insuficiente"""
    saque_data = {
        "valor": 2000.0,  # Maior que saldo + limite (1000 + 500)
        "descricao": "Saque teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/saque",
        json=saque_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Saldo insuficiente" in response.json()["detail"]

def test_realizar_saque_limite_diario(client, auth_headers, sample_conta, db_session):
    """Testa limite de saques diários"""
    # Simular que já foram feitos 3 saques
    sample_conta.saques_realizados = 3
    db_session.commit()
    
    saque_data = {
        "valor": 100.0,
        "descricao": "Saque teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/saque",
        json=saque_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Limite de" in response.json()["detail"]
    assert "saques diários excedido" in response.json()["detail"]

def test_realizar_transferencia_sucesso(client, auth_headers, sample_conta, db_session, sample_cliente):
    """Testa transferência com sucesso"""
    # Criar conta destino
    from app.models import ContaCorrente
    conta_destino = ContaCorrente(
        numero="9876543210",
        agencia="0001",
        saldo=500.0,
        tipo_conta="corrente",
        cliente_id=sample_cliente.id,
        limite=300.0,
        limite_saques=3,
        saques_realizados=0,
        ativa=True
    )
    db_session.add(conta_destino)
    db_session.commit()
    
    transferencia_data = {
        "conta_destino": "9876543210",
        "valor": 300.0,
        "descricao": "Transferência teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/transferencia",
        json=transferencia_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["tipo"] == "transferencia"
    assert data["valor"] == 300.0
    assert data["saldo_anterior"] == 1000.0
    assert data["saldo_posterior"] == 700.0

def test_realizar_transferencia_conta_inexistente(client, auth_headers, sample_conta):
    """Testa transferência para conta inexistente"""
    transferencia_data = {
        "conta_destino": "9999999999",
        "valor": 100.0,
        "descricao": "Transferência teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/transferencia",
        json=transferencia_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Conta de destino não encontrada" in response.json()["detail"]

def test_realizar_transferencia_mesma_conta(client, auth_headers, sample_conta):
    """Testa transferência para a mesma conta"""
    transferencia_data = {
        "conta_destino": sample_conta.numero,
        "valor": 100.0,
        "descricao": "Transferência teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/transferencia",
        json=transferencia_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "mesma conta" in response.json()["detail"]

def test_obter_extrato(client, auth_headers, sample_conta, db_session):
    """Testa obtenção de extrato"""
    # Criar algumas transações
    from app.models import Deposito, Saque
    
    deposito = Deposito(
        tipo="deposito",
        valor=200.0,
        descricao="Depósito teste",
        saldo_anterior=1000.0,
        saldo_posterior=1200.0,
        conta_id=sample_conta.id,
        origem="caixa"
    )
    
    saque = Saque(
        tipo="saque",
        valor=100.0,
        descricao="Saque teste",
        saldo_anterior=1200.0,
        saldo_posterior=1100.0,
        conta_id=sample_conta.id,
        taxa=Decimal('2.50')
    )
    
    db_session.add(deposito)
    db_session.add(saque)
    db_session.commit()
    
    response = client.get(
        f"/transacoes/{sample_conta.numero}/extrato",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["conta_numero"] == sample_conta.numero
    assert data["quantidade_transacoes"] == 2
    assert len(data["transacoes"]) == 2
    assert data["total_depositos"] == 200.0
    assert data["total_saques"] == 100.0

def test_transacao_conta_inexistente(client, auth_headers):
    """Testa transação em conta inexistente"""
    deposito_data = {
        "valor": 100.0,
        "origem": "caixa"
    }
    
    response = client.post(
        "/transacoes/9999999999/deposito",
        json=deposito_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Conta não encontrada" in response.json()["detail"]

def test_valor_maximo_deposito(client, auth_headers, sample_conta):
    """Testa validação de valor máximo para depósito"""
    deposito_data = {
        "valor": 60000.0,  # Acima do limite de 50.000
        "origem": "caixa"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/deposito",
        json=deposito_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_valor_maximo_saque(client, auth_headers, sample_conta):
    """Testa validação de valor máximo para saque"""
    saque_data = {
        "valor": 6000.0,  # Acima do limite de 5.000
        "descricao": "Saque teste"
    }
    
    response = client.post(
        f"/transacoes/{sample_conta.numero}/saque",
        json=saque_data,
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY