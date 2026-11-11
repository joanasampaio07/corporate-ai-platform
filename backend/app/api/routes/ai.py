from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Document
from app.schemas.schemas import AIAnalyzeRequest, AIAnalyzeResponse, AIChatRequest, AIChatResponse
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze_text(
    payload: AIAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    text_to_analyze = payload.text_content
    if payload.document_id:
        doc = db.query(Document).filter(Document.id == payload.document_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento referenciado não encontrado.")
        text_to_analyze = doc.content

    if not text_to_analyze or len(text_to_analyze.strip()) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum conteúdo foi fornecido para análise.")

    result = await AIService.analyze_document(text_to_analyze)
    return AIAnalyzeResponse(**result)


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_docs(
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc_content = None
    if payload.document_id:
        doc = db.query(Document).filter(Document.id == payload.document_id).first()
        if doc:
            doc_content = doc.content

    result = await AIService.chat_rag(payload.question, doc_content)
    return AIChatResponse(**result)

