from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Document, AuditLog
from app.schemas.schemas import DocumentCreate, DocumentUpdate, DocumentResponse
from app.services.ai_service import AIService

router = APIRouter()


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document)
    if department:
        query = query.filter(Document.department == department)
    if category:
        query = query.filter(Document.category == category)
    if search:
        query = query.filter(Document.title.ilike(f"%{search}%") | Document.content.ilike(f"%{search}%"))
    
    return query.order_by(Document.id.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    doc_in: DocumentCreate,
    auto_ai_analyze: bool = Query(True, description="Executa análise por IA automaticamente ao criar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = Document(
        title=doc_in.title,
        content=doc_in.content,
        department=doc_in.department,
        category=doc_in.category,
        confidentiality=doc_in.confidentiality,
        status="Ativo",
        created_by_id=current_user.id
    )
    
    # Se habilitado, enriquece com IA no backend
    if auto_ai_analyze:
        ai_res = await AIService.analyze_document(doc_in.content)
        doc.ai_summary = ai_res["summary"]
        doc.ai_tags = ", ".join(ai_res["tags"])
        doc.ai_analyzed_at = datetime.now(timezone.utc)
    
    db.add(doc)
    
    # Registrar auditoria
    audit = AuditLog(
        user_id=current_user.id,
        action="DOCUMENT_CREATED",
        resource=f"Document:{doc.title}",
        details=f"Criado por {current_user.name} ({current_user.email})"
    )
    db.add(audit)
    
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    return doc


@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: int,
    doc_in: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    
    for field, value in doc_in.dict(exclude_unset=True).items():
        setattr(doc, field, value)
    
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    
    db.delete(doc)
    db.commit()
    return None


@router.post("/{doc_id}/analyze", response_model=DocumentResponse)
async def analyze_document_on_demand(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    
    ai_res = await AIService.analyze_document(doc.content)
    doc.ai_summary = ai_res["summary"]
    doc.ai_tags = ", ".join(ai_res["tags"])
    doc.ai_analyzed_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(doc)
    return doc

