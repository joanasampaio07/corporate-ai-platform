from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Corporate AI & Document Management Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Segurança & JWT
    SECRET_KEY: str = "fiec-sesi-senior-fullstack-secret-key-super-secure-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas
    
    # Banco de Dados (Padrão SQLite para desenvolvimento rápido e independente, compatível com PostgreSQL)
    DATABASE_URL: str = "sqlite:///./corporate.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # IA & LLM (Opcional, com fallback inteligente para modo teste/demo)
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()

