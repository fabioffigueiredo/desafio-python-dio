from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Database
    database_url: str = "mysql+pymysql://banco_user:banco_pass@localhost:3306/banco_dio"
    
    # JWT
    secret_key: str = "sua-chave-secreta-super-segura-aqui-mude-em-producao"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # App
    app_name: str = "Sistema Bancário DIO"
    debug: bool = True
    
    # Security
    bcrypt_rounds: int = 12
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()