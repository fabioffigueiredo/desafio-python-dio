from app.auth.dependencies import get_current_user
from app.auth.security import verify_token
from app.database import get_db
from fastapi.security import HTTPAuthorizationCredentials

# Token de teste
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDUyMDY0MjcyNCIsImV4cCI6MTc1NTEyNTk2MH0.eoT_VnvsvcxLVUyAtb32spTLhu62zcmsBLyRsOXEawQ"

print("Testando verificação do token...")
try:
    payload = verify_token(token)
    print("Token válido:", payload)
except Exception as e:
    print("Erro na verificação do token:", e)

print("\nTestando get_current_user...")
try:
    # Simular HTTPAuthorizationCredentials
    class MockCredentials:
        def __init__(self, token):
            self.credentials = token
    
    credentials = MockCredentials(token)
    db = next(get_db())
    
    user = get_current_user(credentials, db)
    print("Usuário autenticado:", user.nome, "CPF:", user.cpf)
    
except Exception as e:
    print("Erro no get_current_user:", e)
    import traceback
    traceback.print_exc()
finally:
    db.close()