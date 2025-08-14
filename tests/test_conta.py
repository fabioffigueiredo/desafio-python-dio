import pytest
from fastapi import status

def test_criar_conta_corrente(client, auth_headers):
    """Testa criação de conta corrente"""
    conta_data = {
        "tipo_conta": "corrente",
        "limite": 1000.0
    }
    
    response = client.post("/contas/", json=conta_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["tipo_conta"] == "corrente"
    assert data["saldo"] == 0.0
    assert data["ativa"] == True
    assert "numero" in data

def test_criar_conta_poupanca(client, auth_headers):
    """Testa criação de conta poupança"""
    conta_data = {
        "tipo_conta": "poupanca"
    }
    
    response = client.post("/contas/", json=conta_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["tipo_conta"] == "poupanca"
    assert data["saldo"] == 0.0
    assert data["ativa"] == True

def test_criar_multiplas_contas_mesmo_tipo(client, auth_headers, sample_conta):
    """Testa criação de múltiplas contas do mesmo tipo"""
    conta_data = {
        "tipo_conta": "corrente",  # Já existe uma conta corrente
        "limite": 500.0
    }
    
    response = client.post("/contas/", json=conta_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["tipo_conta"] == "corrente"
    assert data["saldo"] == 0.0
    assert data["ativa"] == True

def test_listar_contas(client, auth_headers, sample_conta):
    """Testa listagem de contas do cliente"""
    response = client.get("/contas/", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["numero"] == sample_conta.numero
    assert data[0]["tipo_conta"] == "corrente"

def test_obter_conta_especifica(client, auth_headers, sample_conta):
    """Testa obtenção de conta específica"""
    response = client.get(f"/contas/{sample_conta.numero}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["numero"] == sample_conta.numero
    assert data["saldo"] == 1000.0
    assert "transacoes" in data

def test_obter_conta_inexistente(client, auth_headers):
    """Testa obtenção de conta inexistente"""
    response = client.get("/contas/9999999999", headers=auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Conta não encontrada" in response.json()["detail"]

def test_consultar_saldo(client, auth_headers, sample_conta):
    """Testa consulta de saldo"""
    response = client.get(f"/contas/{sample_conta.numero}/saldo", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["conta_numero"] == sample_conta.numero
    assert data["saldo_atual"] == 1000.0
    assert data["saldo_disponivel"] == 1500.0  # saldo + limite
    assert data["limite"] == 500.0

def test_desativar_conta_com_saldo(client, auth_headers, sample_conta):
    """Testa desativação de conta com saldo"""
    response = client.delete(f"/contas/{sample_conta.numero}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "saldo diferente de zero" in response.json()["detail"]

def test_desativar_conta_sem_saldo(client, auth_headers, sample_conta, db_session):
    """Testa desativação de conta sem saldo"""
    # Zerar saldo da conta
    sample_conta.saldo = 0.0
    db_session.commit()
    
    response = client.delete(f"/contas/{sample_conta.numero}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "desativada com sucesso" in response.json()["message"]

def test_acesso_sem_autenticacao(client):
    """Testa acesso às rotas sem autenticação"""
    response = client.get("/contas/")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_acesso_com_token_invalido(client):
    """Testa acesso com token inválido"""
    headers = {"Authorization": "Bearer token_invalido"}
    response = client.get("/contas/", headers=headers)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED