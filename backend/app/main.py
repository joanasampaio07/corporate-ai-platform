import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.entities import User, Document
from app.api.routes import auth, documents, ai

# Configuração de Logs Estruturados
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("corporate-platform")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Criação das tabelas
    Base.metadata.create_all(bind=engine)
    
    # Carga inicial de dados para demonstração imediata
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@fiec.org.br").first()
        if not admin:
            admin = User(
                name="Joana Sampaio (Full Stack Sr)",
                email="admin@fiec.org.br",
                hashed_password=hash_password("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

            # Documento modelo corporativo
            sample_doc = Document(
                title="Diretrizes de Governança em IA e LGPD 2026 - SESI/FIEC",
                content=(
                    "Este documento estabelece as diretrizes normativas para uso seguro de IA Generativa no Sistema FIEC. "
                    "Todos os sistemas que integrarem modelos de linguagem (LLMs) devem implementar sanitização prévia "
                    "para mascaramento de dados sensíveis e pessoais (como CPF e dados de contato), além de registrar "
                    "logs de auditoria para cada inferência realizada. O controle de custos e cotas de tokens é obrigatório."
                ),
                department="Tecnologia da Informação",
                category="Diretriz Técnica",
                confidentiality="Interno",
                status="Ativo",
                ai_summary="Diretriz corporativa da FIEC estipulando uso seguro de LLMs, mascaramento de dados (LGPD) e monitoramento de tokens.",
                ai_tags="Segurança/LGPD, Sistema FIEC, Tecnologia",
                created_by_id=admin.id
            )
            db.add(sample_doc)
            db.commit()
            logger.info("Base de dados inicializada com usuário administrador e documentos padrão.")
    finally:
        db.close()
    
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Plataforma Corporativa Full Stack Sênior para Gestão de Documentos e Assistência com IA Generativa (SESI/FIEC).",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware de Observabilidade e Latência (Questão 19 da prova!)
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2)) + "ms"
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({round(process_time * 1000, 2)}ms)")
    return response


# Rotas
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Autenticação & Usuários"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Gestão de Documentos"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["Inteligência Artificial & RAG"])


@app.get("/health", tags=["Monitoramento"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "production-ready"
    }

