from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.dependencies import get_current_user
from app.database import get_db
from sqlalchemy.orm import Session

app = FastAPI()
security = HTTPBearer()

@app.get("/test-auth")
async def test_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Endpoint de teste para verificar autenticação"""
    try:
        user = get_current_user(credentials, db)
        return {
            "message": "Autenticação bem-sucedida",
            "user_id": user.id,
            "user_name": user.nome,
            "user_cpf": user.cpf,
            "token": credentials.credentials[:20] + "..."
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erro de autenticação: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)