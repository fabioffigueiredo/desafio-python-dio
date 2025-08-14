import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import date

from app.main import app
from app.database import get_db
from app.models import Base
from app.auth.security import get_password_hash
from app.models import Cliente, Conta, ContaCorrente

# Configurar banco de dados de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Cria uma sessão de banco de dados para testes"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Cria um cliente de teste FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_cliente(db_session):
    """Cria um cliente de exemplo para testes"""
    cliente = Cliente(
        cpf="12345678901",
        nome="João Silva",
        data_nascimento=date(1990, 1, 1),
        endereco="Rua Teste, 123",
        senha_hash=get_password_hash("senha123"),
        ativo=True
    )
    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)
    return cliente

@pytest.fixture
def sample_conta(db_session, sample_cliente):
    """Cria uma conta de exemplo para testes"""
    conta = ContaCorrente(
        numero="1234567890",
        agencia="0001",
        saldo=1000.0,
        tipo_conta="corrente",
        cliente_id=sample_cliente.id,
        limite=500.0,
        limite_saques=3,
        saques_realizados=0,
        ativa=True
    )
    db_session.add(conta)
    db_session.commit()
    db_session.refresh(conta)
    return conta

@pytest.fixture
def auth_headers(client, sample_cliente):
    """Cria headers de autenticação para testes"""
    login_data = {
        "cpf": "12345678901",
        "senha": "senha123"
    }
    response = client.post("/auth/login", json=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}