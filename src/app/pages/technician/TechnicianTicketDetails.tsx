import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Clock, Tag, MessageSquare, Send, User, Calendar, Loader2, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { useTechnicianData } from '../../contexts/TechnicianDataContext';

// Tipos baseados no response do endpoint
interface Status {
  codigo: number;
  descricao: string;
}

interface Prioridade {
  codigo: number;
  descricao: string;
  sla?: number;
}

interface Categoria {
  codigo: number;
  descricao: string;
}

interface Responsavel {
  codigo: number;
  nome: string;
}

interface Chamado {
  codigo: number;
  titulo: string;
  descricao: string;
  codStatus: number;
  codPrioridade: number;
  codCategoria: number;
  codUser: number;
  codUserResponsavel: number | null;
  dataCriacao: string;
  dataConclusao: string | null;
  horasEstimadas: number | null;
  status: Status;
  prioridade: Prioridade;
  categoria: Categoria;
  responsavel: Responsavel | null;
}

interface Comentario {
  codigo: number;
  codigoChamado: number;
  comentario: string;
  codUser: number;
  data: string;
  usuario: string; // Nome do usuário como string direta
}

interface DetalhesData {
  chamado: Chamado;
  comentarios: Comentario[];
}

export function TechnicianTicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: dashboardData, refetch } = useTechnicianData();
  const [data, setData] = useState<DetalhesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<number>(0);
  const [editedPriority, setEditedPriority] = useState<number>(0);
  const [editedResponsible, setEditedResponsible] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Estados para opções dos dropdowns
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<Prioridade[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<Responsavel[]>([]);
  const [technicianIds, setTechnicianIds] = useState<Set<number>>(new Set());

  // Buscar detalhes do chamado
  const fetchTicketDetails = () => {
    setLoading(true);
    fetch(`https://www.fitacabo.ddns.com.br/api/chamados/detalhes/${id}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Chamado não encontrado');
          } else if (response.status === 403) {
            throw new Error('Você não tem permissão para acessar este chamado');
          }
          throw new Error('Erro ao buscar detalhes do chamado');
        }
        return response.json();
      })
      .then((data: DetalhesData) => {
        setData(data);
        setEditedStatus(data.chamado.codStatus);
        setEditedPriority(data.chamado.codPrioridade);
        setEditedResponsible(data.chamado.codUserResponsavel);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('https://www.fitacabo.ddns.com.br/api/chamados/comentar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoChamado: Number(id),
          comentario: newComment.trim(),
          codUser: 201, // Código fixo do técnico para testes
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.mensagem || 'Erro ao adicionar comentário');
      }

      // Limpar campo e recarregar dados
      setNewComment('');
      fetchTicketDetails();
      refetch(); // Atualiza o dashboard também
      setSubmitting(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao adicionar comentário');
      setSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!data) return;

    setSaving(true);
    setSubmitError(null);

    try {
      const response = await fetch(`https://www.fitacabo.ddns.com.br/api/chamados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codStatus: editedStatus,
          codPrioridade: editedPriority,
          codUserResponsavel: editedResponsible,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.mensagem || 'Erro ao atualizar chamado');
      }

      // Recarregar dados e sair do modo de edição
      fetchTicketDetails();
      refetch(); // Atualiza o dashboard também
      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao atualizar chamado');
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!data) return;
    
    setEditedStatus(data.chamado.codStatus);
    setEditedPriority(data.chamado.codPrioridade);
    setEditedResponsible(data.chamado.codUserResponsavel);
    setIsEditing(false);
    setSubmitError(null);
  };

  // Buscar opções para os dropdowns quando entrar em modo de edição
  const fetchEditOptions = async () => {
    setLoadingOptions(true);
    try {
      // Buscar opções em paralelo
      const [opcoesRes, techRes] = await Promise.all([
        fetch('https://www.fitacabo.ddns.com.br/api/chamados/opcoes'),
        fetch('https://www.fitacabo.ddns.com.br/api/chamados/tecnicos'),
      ]);

      const opcoesData = await opcoesRes.json();
      const techData = await techRes.json();

      console.log('📊 Dados recebidos de /api/chamados/opcoes:', opcoesData);
      console.log('👥 Dados recebidos de /api/chamados/tecnicos:', techData);

      // Garantir que sempre sejam arrays
      const prioridades = Array.isArray(opcoesData.prioridades) ? opcoesData.prioridades : [];
      const status = Array.isArray(opcoesData.status) ? opcoesData.status : [];
      const tecnicos = Array.isArray(techData) ? techData : [];

      console.log('✅ Prioridades processadas:', prioridades);
      console.log('✅ Status processados:', status);
      console.log('✅ Técnicos processados:', tecnicos);

      setPriorityOptions(prioridades);
      setStatusOptions(status);
      setTechnicianOptions(tecnicos);
      
      // Criar Set com IDs dos técnicos para verificação rápida
      const techIds = new Set(tecnicos.map((t: Responsavel) => t.codigo));
      setTechnicianIds(techIds);
      
      setLoadingOptions(false);
    } catch (err) {
      console.error('❌ Erro ao carregar opções:', err);
      setPriorityOptions([]);
      setStatusOptions([]);
      setTechnicianOptions([]);
      setTechnicianIds(new Set());
      setLoadingOptions(false);
    }
  };

  // Carregar lista de técnicos ao abrir a página (para verificação nos comentários)
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const techRes = await fetch('https://www.fitacabo.ddns.com.br/api/chamados/tecnicos');
        const techData = await techRes.json();
        const tecnicos = Array.isArray(techData) ? techData : [];
        const techIds = new Set(tecnicos.map((t: Responsavel) => t.codigo));
        setTechnicianIds(techIds);
      } catch (err) {
        console.error('Erro ao carregar lista de técnicos:', err);
      }
    };
    
    loadTechnicians();
  }, []);

  // Effect para carregar opções quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && statusOptions.length === 0) {
      fetchEditOptions();
    }
  }, [isEditing]);

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando chamado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/tecnico/chamados"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para todos os chamados
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Erro ao carregar chamado</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { chamado, comentarios } = data;

  // Função auxiliar para determinar a cor dos badges
  const getPriorityColor = (descricao: string) => {
    switch (descricao.toLowerCase()) {
      case 'crítica':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'média':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (descricao: string) => {
    switch (descricao.toLowerCase()) {
      case 'aberto':
        return 'bg-blue-100 text-blue-800';
      case 'em atendimento':
        return 'bg-yellow-100 text-yellow-800';
      case 'aguardando':
        return 'bg-orange-100 text-orange-800';
      case 'resolvido':
        return 'bg-green-100 text-green-800';
      case 'fechado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSLA = (hours: number) => {
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        to="/tecnico/chamados"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para todos os chamados
      </Link>

      {/* Cabeçalho do Ticket com Botão de Edição */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-sm font-mono text-gray-500">Chamado #{chamado.codigo}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(chamado.prioridade.descricao)}`}>
                {chamado.prioridade.descricao}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                {chamado.categoria.descricao}
              </span>
              {!chamado.codUserResponsavel && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                  Não atribuído
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{chamado.titulo}</h1>
            <p className="text-gray-700 leading-relaxed">{chamado.descricao}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(chamado.status.descricao)}`}>
              {chamado.status.descricao}
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Editar Chamado
              </button>
            )}
          </div>
        </div>

        {/* Modo de Edição */}
        {isEditing && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Informações do Chamado</h3>
            
            {submitError && (
              <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">Erro ao salvar alterações</p>
                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(Number(e.target.value))}
                  disabled={loadingOptions}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {statusOptions.map(status => (
                    <option key={status.codigo} value={status.codigo}>
                      {status.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(Number(e.target.value))}
                  disabled={loadingOptions}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.codigo} value={priority.codigo}>
                      {priority.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <select
                  value={editedResponsible || ''}
                  onChange={(e) => setEditedResponsible(e.target.value ? Number(e.target.value) : null)}
                  disabled={loadingOptions}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Não atribuído</option>
                  {technicianOptions.map(tech => (
                    <option key={tech.codigo} value={tech.codigo}>
                      {tech.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informações do Ticket */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Criado em</p>
              <p className="font-medium text-gray-900 text-sm">{formatDate(chamado.dataCriacao)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Última atualização</p>
              <p className="font-medium text-gray-900 text-sm">{formatDate(chamado.dataConclusao || chamado.dataCriacao)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Responsável</p>
              <p className="font-medium text-gray-900 text-sm">
                {chamado.responsavel ? chamado.responsavel.nome : 'Aguardando atribuição'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expectativa de SLA */}
      {chamado.prioridade.sla && (
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-purple-900">SLA de Resolução</p>
              <p className="text-sm text-purple-700 mt-1">
                Prazo esperado para resolução: <strong>{formatSLA(chamado.prioridade.sla)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conversação */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Atendimento</h2>
          <span className="text-sm text-gray-500">({comentarios.length} atualizações)</span>
        </div>

        {/* Lista de Mensagens - Timeline */}
        <div className="space-y-4 mb-6">
          {comentarios.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma atualização ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Seja o primeiro a adicionar um comentário
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical da timeline */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {comentarios.map((comment) => {
                // Verificar se o codUser do comentário está na lista de técnicos
                const isTechnician = technicianIds.has(comment.codUser);

                return (
                  <div key={comment.codigo} className="relative flex gap-4 pb-6">
                    {/* Avatar com ícone */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      isTechnician 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {comment.usuario.charAt(0).toUpperCase()}
                    </div>

                    {/* Conteúdo do comentário */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{comment.usuario}</p>
                          <p className="text-xs text-gray-500">{formatDate(comment.data)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isTechnician 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isTechnician ? 'Técnico' : 'Cliente'}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.comentario}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Erro de Submit */}
        {submitError && !isEditing && (
          <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Erro ao enviar comentário</p>
                <p className="text-sm text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Nova Mensagem */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Comentário
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione atualizações, soluções ou peça mais informações ao cliente..."
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Adicionar Comentário
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}