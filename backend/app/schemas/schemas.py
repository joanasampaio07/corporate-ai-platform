from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ===================== USER SCHEMAS =====================
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    role: Optional[str] = "analyst"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===================== DOCUMENT SCHEMAS =====================
class DocumentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    department: Optional[str] = "Tecnologia da Informação"
    category: Optional[str] = "Contrato"
    confidentiality: Optional[str] = "Interno"


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    confidentiality: Optional[str] = None
    status: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: int
    status: str
    ai_summary: Optional[str] = None
    ai_tags: Optional[str] = None
    ai_analyzed_at: Optional[datetime] = None
    created_by_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===================== AI SCHEMAS =====================
class AIAnalyzeRequest(BaseModel):
    document_id: Optional[int] = None
    text_content: Optional[str] = None


class AIAnalyzeResponse(BaseModel):
    summary: str
    category: str
    tags: List[str]
    sentiment: str
    confidentiality_risk: str
    tokens_estimated: int


class AIChatMessage(BaseModel):
    role: str  # "user" ou "assistant"
    content: str


class AIChatRequest(BaseModel):
    question: str
    document_id: Optional[int] = None
    history: Optional[List[AIChatMessage]] = []


class AIChatResponse(BaseModel):
    answer: str
    sources_used: List[str]
    compliance_lgpd_verified: bool
    latency_ms: int

