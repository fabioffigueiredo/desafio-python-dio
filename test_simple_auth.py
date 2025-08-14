#!/usr/bin/env python3

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn

app = FastAPI()
security = HTTPBearer()

@app.get("/test-simple")
async def test_simple_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Endpoint simples para testar autenticação"""
    token = credentials.credentials
    return {"message": "Autenticação funcionando!", "token_received": token[:20] + "..."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)