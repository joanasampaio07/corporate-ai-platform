// Serviço Inteligente Híbrido: Conecta ao FastAPI local OU opera em modo Demo no GitHub Pages!

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Dados iniciais para modo GitHub Pages / Demonstração
const INITIAL_DOCS = [
  {
    id: 1,
    title: "Diretrizes de Governança em IA e LGPD 2026 - SESI/FIEC",
    content: "Este documento estabelece as diretrizes normativas para uso seguro de IA Generativa no Sistema FIEC. Todos os sistemas que integrarem modelos de linguagem (LLMs) devem implementar sanitização prévia para mascaramento de dados sensíveis e pessoais (como CPF e dados de contato), além de registrar logs de auditoria para cada inferência realizada. O controle de custos e cotas de tokens é obrigatório.",
    department: "Tecnologia da Informação",
    category: "Diretriz Técnica",
    confidentiality: "Interno",
    status: "Ativo",
    ai_summary: "Diretriz corporativa da FIEC estipulando uso seguro de LLMs, mascaramento de dados (LGPD) e monitoramento de tokens.",
    ai_tags: "Segurança/LGPD, Sistema FIEC, Tecnologia",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Termo de Parceria para Modernização Industrial com o SENAI",
    content: "Acordo de cooperação técnica para aceleração de diagnósticos de maturidade digital na indústria cearense. O projeto envolve integração de sensores IoT com pipelines de ingestão e geração de relatórios automatizados para gestores de manufatura.",
    department: "Inovação e Tecnologia",
    category: "Contrato",
    confidentiality: "Público",
    status: "Ativo",
    ai_summary: "Acordo de cooperação entre SENAI e indústrias para monitoramento IoT e relatórios automatizados.",
    ai_tags: "Inovação, Manufatura, Indústria 4.0",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token') || 'demo-jwt-token-fiec-2026';
    this.user = JSON.parse(localStorage.getItem('user')) || {
      name: "Joana Sampaio (Full Stack Sr)",
      email: "admin@fiec.org.br",
      role: "admin"
    };
    
    // Inicializar documentos locais se não existirem
    if (!localStorage.getItem('corporate_docs')) {
      localStorage.setItem('corporate_docs', JSON.stringify(INITIAL_DOCS));
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async checkBackendAvailable() {
    try {
      const res = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(1000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async login(email, password) {
    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const data = await res.json();
      this.token = data.access_token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      return data;
    }

    // Modo Standalone (GitHub Pages)
    this.token = 'mock-jwt-token-fiec';
    this.user = { name: "Joana Sampaio (Full Stack Sr)", email, role: "admin" };
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
    return { access_token: this.token, user: this.user };
  }

  async getDocuments(search = '') {
    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const url = search ? `${API_BASE_URL}/documents/?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/documents/`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    }

    // Modo Local
    let docs = JSON.parse(localStorage.getItem('corporate_docs') || '[]');
    if (search) {
      docs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase()));
    }
    return docs;
  }

  async createDocument(docData) {
    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const res = await fetch(`${API_BASE_URL}/documents/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(docData)
      });
      if (res.ok) return await res.json();
    }

    // Modo Local enriquecido com IA simulada
    const docs = JSON.parse(localStorage.getItem('corporate_docs') || '[]');
    const newDoc = {
      ...docData,
      id: Date.now(),
      status: "Ativo",
      ai_summary: `Resumo Executivo: ${docData.content.slice(0, 160)}...`,
      ai_tags: "Tecnologia, Gestão, Sistema FIEC",
      created_at: new Date().toISOString()
    };
    docs.unshift(newDoc);
    localStorage.setItem('corporate_docs', JSON.stringify(docs));
    return newDoc;
  }

  async deleteDocument(id) {
    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      await fetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE', headers: this.getHeaders() });
    }
    let docs = JSON.parse(localStorage.getItem('corporate_docs') || '[]');
    docs = docs.filter(d => d.id !== id);
    localStorage.setItem('corporate_docs', JSON.stringify(docs));
    return true;
  }

  async askAI(question, documentId = null) {
    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ question, document_id: documentId })
      });
      if (res.ok) return await res.json();
    }

    // Modo Standalone RAG
    return {
      answer: `[IA Corporativa FIEC/SESI] Em relação à pergunta "${question}": De acordo com a documentação corporativa e padrões de arquitetura vigentes, recomenda-se a padronização de serviços RESTful, validação estrita com schemas, segurança via tokens JWT e observabilidade contínua.`,
      sources_used: ["Manual de Governança Digital e LGPD do Sistema FIEC"],
      compliance_lgpd_verified: true,
      latency_ms: 120
    };
  }
}

export const api = new ApiClient();

