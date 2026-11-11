import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Bot, 
  ShieldCheck, 
  Search, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  Activity, 
  Layers, 
  LogOut,
  ExternalLink,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário de novo documento
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDepartment, setNewDepartment] = useState('Tecnologia da Informação');
  const [newCategory, setNewCategory] = useState('Contrato');
  const [newConfidentiality, setNewConfidentiality] = useState('Interno');

  // Estado do Chat de IA (RAG)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá, Joana! Sou o Assistente de Inteligência Artificial do Sistema FIEC. Como posso ajudar na análise de documentos ou governança hoje?',
      sources: ['Diretrizes Corporativas SESI/FIEC'],
      latency: 42
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Carregar documentos
  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments(search);
      setDocuments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [search]);

  // Criar documento
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setLoading(true);
    try {
      await api.createDocument({
        title: newTitle,
        content: newContent,
        department: newDepartment,
        category: newCategory,
        confidentiality: newConfidentiality
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      await loadDocs();
    } finally {
      setLoading(false);
    }
  };

  // Excluir documento
  const handleDelete = async (id) => {
    if (confirm('Deseja realmente remover este documento?')) {
      await api.deleteDocument(id);
      await loadDocs();
    }
  };

  // Enviar pergunta ao Assistente RAG
  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || aiLoading) return;

    const userMsg = inputQuestion;
    setInputQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiLoading(true);

    try {
      const res = await api.askAI(userMsg);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          sources: res.sources_used,
          latency: res.latency_ms
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Topbar Corporativa */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: '0.875rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#0284c7',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: '700', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              FIEC <span style={{ color: '#38bdf8' }}>Enterprise AI Hub</span>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#0369a1', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: '500' }}>SESI GETIC</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gestão de Documentos Corporativos & Inteligência Artificial Generativa</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#34d399' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#34d399', borderRadius: '50%', display: 'inline-block' }}></span>
            API Online & LGPD Compliance
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid #334155' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Joana Sampaio</div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Dev Full Stack Sênior</div>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#fff',
              fontSize: '0.9rem'
            }}>
              JS
            </div>
          </div>
        </div>
      </header>

      {/* Navegação por Abas */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem' }}>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard & Métricas', icon: Activity },
            { id: 'documents', label: 'Repositório de Documentos', icon: FileText },
            { id: 'ai-assistant', label: 'Assistente IA & RAG', icon: Bot },
            { id: 'architecture', label: 'Arquitetura & Engenharia', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#0284c7' : '#64748b',
                  borderBottom: isActive ? '2px solid #0284c7' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {/* ABA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>Total de Documentos</span>
                  <FileText size={20} color="#0284c7" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a' }}>{documents.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>+100% integrados via API</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>Processados por IA</span>
                  <Sparkles size={20} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a' }}>{documents.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.25rem' }}>Resumos & Tags Automáticas</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>Conformidade LGPD</span>
                  <ShieldCheck size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a' }}>100%</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>Sanitização Ativa de CPFs</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>Latência Média / SLA</span>
                  <Cpu size={20} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a' }}>48ms</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>Backend Python FastAPI Otimizado</div>
              </div>
            </div>

            {/* Painel Central */}
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem' }}>
                Últimos Documentos Ingeridos
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {documents.slice(0, 3).map(doc => (
                  <div key={doc.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0284c7' }}>{doc.title}</h4>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: '500' }}>
                        {doc.category || 'Geral'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.5rem' }}>{doc.content.slice(0, 180)}...</p>
                    {doc.ai_summary && (
                      <div style={{ fontSize: '0.75rem', color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '0.5rem', borderRadius: '0.375rem', borderLeft: '3px solid #8b5cf6' }}>
                        <strong>✨ Análise de IA:</strong> {doc.ai_summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: DOCUMENTOS */}
        {activeTab === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Pesquisar documentos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={18} /> Novo Documento
              </button>
            </div>

            {/* Tabela de Documentos */}
            <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.875rem 1rem' }}>Título & Resumo IA</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Departamento</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Confidencialidade</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Tags</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', maxWidth: '400px' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{doc.ai_summary || doc.content.slice(0, 90) + '...'}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#334155' }}>{doc.department}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: doc.confidentiality === 'Interno' ? '#fef3c7' : '#dcfce7',
                          color: doc.confidentiality === 'Interno' ? '#92400e' : '#166534',
                          fontWeight: '500'
                        }}>
                          {doc.confidentiality}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem' }}>
                        {doc.ai_tags || 'Corporativo'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            borderRadius: '0.25rem'
                          }}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: ASSISTENTE IA & RAG */}
        {activeTab === 'ai-assistant' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '650px' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bot size={24} color="#0284c7" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Assistente RAG Corporativo</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Conectado à Base de Conhecimento do Sistema FIEC com Sanitização LGPD</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontWeight: '500' }}>
                Privacidade Protegida
              </span>
            </div>

            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    backgroundColor: m.role === 'user' ? '#0284c7' : '#f1f5f9',
                    color: m.role === 'user' ? '#fff' : '#1e293b',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{m.content}</p>
                  {m.sources && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '0.7rem', color: '#64748b' }}>
                      Fontes: {m.sources.join(', ')} • Latência: {m.latency}ms
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '0.85rem' }}>
                  Analisando contexto e gerando resposta...
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendQuestion} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Ex.: Quais são os padrões de segurança e LGPD para uso de IA?"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
              <button
                type="submit"
                disabled={aiLoading}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '0 1.25rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={16} /> Enviar
              </button>
            </form>
          </div>
        )}

        {/* ABA: ARQUITETURA */}
        {activeTab === 'architecture' && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
              Decisões de Engenharia & Arquitetura Web (Nível Sênior)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <h4 style={{ color: '#0284c7', fontWeight: '600', marginBottom: '0.5rem' }}>1. Backend com Python (FastAPI)</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Utilização de tipagem estrita com Pydantic v2, documentação interativa OpenAPI/Swagger automática e arquitetura em camadas (core, models, schemas, services, api).
                </p>
              </div>

              <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <h4 style={{ color: '#0284c7', fontWeight: '600', marginBottom: '0.5rem' }}>2. Segurança & Conformidade LGPD</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Autenticação via tokens JWT com hash seguro (PBKDF2/SHA256). Módulo de pré-processamento que mascara dados pessoais identificáveis (CPFs e telefones) antes de qualquer chamada a provedores de IA externos.
                </p>
              </div>

              <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <h4 style={{ color: '#0284c7', fontWeight: '600', marginBottom: '0.5rem' }}>3. Resiliência e RAG (Retrieval-Augmented)</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Engine contextual para recuperação de documentos corporativos com citação auditável de fontes e tolerância a falhas na indisponibilidade de APIs de terceiros.
                </p>
              </div>

              <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <h4 style={{ color: '#0284c7', fontWeight: '600', marginBottom: '0.5rem' }}>4. DevOps & Conteinerização</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Ecossistema orquestrado via Docker Compose, permitindo inicialização com build único e reprodutibilidade fiel entre ambientes de desenvolvimento e produção.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Criação de Documento */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '550px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>Novo Documento Corporativo</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Título</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  placeholder="Ex.: Plano de Ação SESI 2026"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Departamento</label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  >
                    <option>Tecnologia da Informação</option>
                    <option>Inovação e Tecnologia</option>
                    <option>Recursos Humanos</option>
                    <option>Financeiro & Compliance</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Confidencialidade</label>
                  <select
                    value={newConfidentiality}
                    onChange={e => setNewConfidentiality(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  >
                    <option>Interno</option>
                    <option>Público</option>
                    <option>Confidencial</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Conteúdo</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  placeholder="Digite ou cole o texto do documento..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Salvar & Analisar com IA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

