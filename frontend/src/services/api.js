// Serviço Inteligente Híbrido: Conecta ao FastAPI local OU opera em modo Demo no GitHub Pages!
// Com camada abrangente de Segurança, Auditoria e LGPD

const API_BASE_URL = 'http://localhost:8000/api/v1';

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

const INITIAL_LOGS = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: "admin@fiec.org.br",
    action: "USER_AUTH_SUCCESS",
    resource: "/api/v1/auth/login",
    status: "ALLOWED",
    ip: "10.0.12.45",
    details: "Autenticação via JWT (Bearer Token) autorizada."
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    user: "admin@fiec.org.br",
    action: "LGPD_DATA_SANITIZED",
    resource: "AIService.sanitize_lgpd",
    status: "MASKED",
    ip: "10.0.12.45",
    details: "CPF e dados cadastrais mascarados antes do envio ao modelo."
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    user: "admin@fiec.org.br",
    action: "PROMPT_INJECTION_DEFENSE",
    resource: "/api/v1/ai/chat",
    status: "PROTECTED",
    ip: "10.0.12.45",
    details: "Validação OWASP for LLMs: prompt inspecionado e seguro."
  }
];

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token') || null;
    this.user = JSON.parse(localStorage.getItem('user')) || null;
    
    if (!localStorage.getItem('corporate_docs')) {
      localStorage.setItem('corporate_docs', JSON.stringify(INITIAL_DOCS));
    }
    if (!localStorage.getItem('audit_logs')) {
      localStorage.setItem('audit_logs', JSON.stringify(INITIAL_LOGS));
    }
  }

  isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  getCurrentUser() {
    return this.user;
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

  // Sanitizador Avançado LGPD (Executado no cliente e no servidor)
  sanitizeLGPD(text) {
    if (!text) return '';
    let sanitized = text;
    // CPF
    sanitized = sanitized.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[DADO PESSOAL - CPF PROTEGIDO]');
    // CNPJ
    sanitized = sanitized.replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[CNPJ PROTEGIDO]');
    // Telefones
    sanitized = sanitized.replace(/\b(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-.\s]?\d{4}\b/g, '[TELEFONE PROTEGIDO]');
    // E-mails
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[E-MAIL PROTEGIDO]');
    // Cartões de Crédito
    sanitized = sanitized.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[CARTÃO DE CRÉDITO MASCARADO]');
    return sanitized;
  }

  // Verificação contra Prompt Injection (OWASP LLM01)
  detectPromptInjection(text) {
    const maliciousPatterns = [
      /ignore\s+(previous|all)\s+instructions/i,
      /esqueça\s+(todas\s+as\s+)?instruções/i,
      /system\s+prompt/i,
      /bypass\s+rules/i,
      /jailbreak/i,
      /drop\s+database/i,
      /delete\s+from/i
    ];
    for (const pattern of maliciousPatterns) {
      if (pattern.test(text)) {
        this.addAuditLog('SECURITY_ALERT', 'Tentativa de Injeção de Prompt ou SQL detectada e bloqueada!', 'BLOCKED');
        return true;
      }
    }
    return false;
  }

  addAuditLog(action, details, status = 'ALLOWED') {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: this.user ? this.user.email : 'anônimo',
      action,
      resource: '/system/audit',
      status,
      ip: '177.136.240.12',
      details
    };
    logs.unshift(newLog);
    localStorage.setItem('audit_logs', JSON.stringify(logs.slice(0, 50)));
    return newLog;
  }

  getAuditLogs() {
    return JSON.parse(localStorage.getItem('audit_logs') || '[]');
  }

  async login(email, password) {
    if (!email || !password) throw new Error('E-mail e senha são obrigatórios.');

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
      if (!res.ok) {
        this.addAuditLog('USER_AUTH_FAILED', `Falha de autenticação para ${email}`, 'REJECTED');
        throw new Error('E-mail ou senha incorretos.');
      }
      const data = await res.json();
      this.token = data.access_token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      this.addAuditLog('USER_AUTH_SUCCESS', `Login bem-sucedido para ${email}`, 'ALLOWED');
      return data;
    }

    // Modo Standalone
    if (password.length < 4) {
      this.addAuditLog('USER_AUTH_FAILED', `Senha inválida para ${email}`, 'REJECTED');
      throw new Error('A senha deve conter no mínimo 4 caracteres.');
    }

    this.token = 'jwt-session-token-' + Date.now();
    this.user = {
      name: email.includes('admin') ? "Joana Sampaio (Full Stack Sr)" : "Analista Corporativo SESI",
      email: email,
      role: email.includes('admin') ? "admin" : "analyst"
    };
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
    this.addAuditLog('USER_AUTH_SUCCESS', `Login realizado com sucesso: ${email}`, 'ALLOWED');
    return { access_token: this.token, user: this.user };
  }

  logout() {
    this.addAuditLog('USER_LOGOUT', `Sessão encerrada para ${this.user?.email || 'usuário'}`, 'ALLOWED');
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getDocuments(search = '') {
    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const url = search ? `${API_BASE_URL}/documents/?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/documents/`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    }

    let docs = JSON.parse(localStorage.getItem('corporate_docs') || '[]');
    if (search) {
      docs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase()));
    }
    return docs;
  }

  async createDocument(docData) {
    // Sanitização prévia LGPD obrigatória
    const sanitizedContent = this.sanitizeLGPD(docData.content);

    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const res = await fetch(`${API_BASE_URL}/documents/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ...docData, content: sanitizedContent })
      });
      if (res.ok) {
        this.addAuditLog('DOCUMENT_CREATE', `Documento criado: ${docData.title}`, 'ALLOWED');
        return await res.json();
      }
    }

    const docs = JSON.parse(localStorage.getItem('corporate_docs') || '[]');
    const newDoc = {
      ...docData,
      content: sanitizedContent,
      id: Date.now(),
      status: "Ativo",
      ai_summary: `Resumo Executivo (LGPD Sanitizado): ${sanitizedContent.slice(0, 160)}...`,
      ai_tags: "Tecnologia, Gestão, Sistema FIEC",
      created_at: new Date().toISOString()
    };
    docs.unshift(newDoc);
    localStorage.setItem('corporate_docs', JSON.stringify(docs));
    this.addAuditLog('DOCUMENT_CREATE', `Documento criado com sanitização LGPD: ${docData.title}`, 'ALLOWED');
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
    this.addAuditLog('DOCUMENT_DELETE', `Documento ID ${id} excluído`, 'ALLOWED');
    return true;
  }

  async askAI(question, documentId = null) {
    // 1. Proteção contra Injeção de Prompt
    if (this.detectPromptInjection(question)) {
      return {
        answer: "⚠️ [BLOQUEIO DE SEGURANÇA OWASP LLM01]: A sua mensagem acionou os filtros de segurança por conter comandos proibidos ou tentativa de injeção de prompt. A requisição foi bloqueada e registrada na auditoria.",
        sources_used: ["Firewall de IA / OWASP Compliance"],
        compliance_lgpd_verified: true,
        latency_ms: 15
      };
    }

    // 2. Sanitização LGPD
    const sanitizedQuestion = this.sanitizeLGPD(question);

    const isOnline = await this.checkBackendAvailable();
    if (isOnline) {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ question: sanitizedQuestion, document_id: documentId })
      });
      if (res.ok) {
        this.addAuditLog('AI_INFERENCE_RAG', `Consulta RAG: "${sanitizedQuestion.slice(0, 40)}..."`, 'ALLOWED');
        return await res.json();
      }
    }

    this.addAuditLog('AI_INFERENCE_RAG', `Consulta RAG com sanitização LGPD: "${sanitizedQuestion.slice(0, 40)}..."`, 'ALLOWED');
    return {
      answer: `[IA Corporativa FIEC/SESI] Com base na documentação corporativa e normas de segurança:\nEm relação à consulta "${sanitizedQuestion}", os padrões arquiteturais determinam estrito controle de concorrência, idempotência em operações transacionais, observabilidade distribuída com logs estruturados e proteção irrestrita aos dados pessoais em conformidade com a LGPD (Lei 13.709/2018).`,
      sources_used: [
        "Diretrizes Normativas de Governança Digital e LGPD do Sistema FIEC",
        "Padrões de Engenharia de Software SESI GETIC 2026"
      ],
      compliance_lgpd_verified: true,
      latency_ms: 68
    };
  }
}

export const api = new ApiClient();
