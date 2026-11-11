from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login_admin():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@fiec.org.br", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@fiec.org.br"


def test_create_and_list_document():
    # 1. Login
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@fiec.org.br", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Criar Documento
    new_doc = {
        "title": "Edital de Inovação Industrial 2026",
        "content": "Programa do SENAI e SESI para fomento a tecnologias industriais e automação em empresas do Ceará.",
        "department": "Inovação e Tecnologia",
        "category": "Edital",
        "confidentiality": "Público"
    }
    create_res = client.post("/api/v1/documents/", json=new_doc, headers=headers)
    assert create_res.status_code == 201
    doc_data = create_res.json()
    assert doc_data["title"] == new_doc["title"]
    assert doc_data["ai_summary"] is not None

    # 3. Listar Documentos
    list_res = client.get("/api/v1/documents/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_ai_chat_rag():
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@fiec.org.br", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    chat_payload = {
        "question": "Quais são as diretrizes de segurança e LGPD para uso de IA?",
        "history": []
    }
    chat_res = client.post("/api/v1/ai/chat", json=chat_payload, headers=headers)
    assert chat_res.status_code == 200
    res_data = chat_res.json()
    assert "answer" in res_data
    assert res_data["compliance_lgpd_verified"] is True

