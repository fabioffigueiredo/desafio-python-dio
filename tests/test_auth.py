import pytest
from fastapi import status

def test_register_cliente(client):
    """Testa o registro de um novo cliente"""
    register_data = {
        "cpf": "12345678901",
        "nome": "João Silva",
        "data_nascimento": "1990-01-01",
        "endereco": "Rua Teste, 123",
        "password": "senha123",
        "password_confirm": "senha123"
    }
    
    response = client.post("/auth/register", json=register_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "Cliente cadastrado com sucesso"
    assert data["cpf"] == "12345678901"
    assert "cliente_id" in data

def test_register_cliente_cpf_duplicado(client, sample_cliente):
    """Testa registro com CPF já existente"""
    register_data = {
        "cpf": "12345678901",  # CPF do sample_cliente
        "nome": "Maria Silva",
        "data_nascimento": "1995-01-01",
        "endereco": "Rua Teste, 456",
        "password": "senha456",
        "password_confirm": "senha456"
    }
    
    response = client.post("/auth/register", json=register_data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "CPF já cadastrado" in response.json()["detail"]

def test_register_cliente_senhas_diferentes(client):
    """Testa registro com senhas diferentes"""
    register_data = {
        "cpf": "98765432109",
        "nome": "Maria Silva",
        "data_nascimento": "1995-01-01",
        "endereco": "Rua Teste, 456",
        "password": "senha123",
        "password_confirm": "senha456"  # Senha diferente
    }
    
    response = client.post("/auth/register", json=register_data)
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_login_sucesso(client, sample_cliente):
    """Testa login com credenciais válidas"""
    login_data = {
        "cpf": "12345678901",
        "password": "senha123"
    }
    
    response = client.post("/auth/login", json=login_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data

def test_login_cpf_invalido(client):
    """Testa login com CPF inexistente"""
    login_data = {
        "cpf": "99999999999",
        "password": "senha123"
    }
    
    response = client.post("/auth/login", json=login_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "CPF ou senha incorretos" in response.json()["detail"]

def test_login_senha_invalida(client, sample_cliente):
    """Testa login com senha incorreta"""
    login_data = {
        "cpf": "12345678901",
        "password": "senha_errada"
    }
    
    response = client.post("/auth/login", json=login_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "CPF ou senha incorretos" in response.json()["detail"]

def test_login_cliente_inativo(client, db_session, sample_cliente):
    """Testa login com cliente inativo"""
    # Desativar cliente
    sample_cliente.ativo = False
    db_session.commit()
    
    login_data = {
        "cpf": "12345678901",
        "password": "senha123"
    }
    
    response = client.post("/auth/login", json=login_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Conta desativada" in response.json()["detail"]

def test_logout(client):
    """Testa endpoint de logout"""
    response = client.post("/auth/logout")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Logout realizado com sucesso"