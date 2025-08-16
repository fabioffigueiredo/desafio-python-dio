from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import create_tables
from .routes import auth, conta, transacao, pix

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    # Startup
    try:
        create_tables()
        print("✅ Tabelas do banco de dados criadas/verificadas")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        raise
    
    yield
    
    # Shutdown
    print("🔄 Aplicação finalizada")

# Criar instância do FastAPI
app = FastAPI(
    title="Sistema Bancário DIO",
    description="API RESTful para sistema bancário desenvolvido para o desafio da DIO",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(conta.router)
app.include_router(transacao.router)
app.include_router(pix.router)

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Sistema Bancário DIO - API RESTful",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Endpoint para verificação de saúde da aplicação"""
    return {
        "status": "healthy",
        "service": "Sistema Bancário DIO"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )