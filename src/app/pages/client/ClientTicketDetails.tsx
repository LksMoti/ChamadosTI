import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router';
import { ArrowLeft, Clock, MessageSquare, Send, User, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useUserFromUrl } from '../../hooks/useUserFromUrl';

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
  comentarios: Comentario[];
}

interface LocationState {
  chamado?: Chamado;
}

export function ClientTicketDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const chamadoFromState = (location.state as LocationState)?.chamado;

  const [chamado, setChamado] = useState<Chamado | null>(chamadoFromState || null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const userParams = useUserFromUrl(); // Pega dados do usuário da URL

  // Buscar apenas comentários do chamado
  const fetchTicketDetails = () => {
    setLoading(true);
    fetch(`https://www.fitacabo.ddns.com.br/api/chamados/detalhes/${id}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Chamado não encontrado');
          } else if (response.status === 403) {
            throw new Error('Você não tem permissão para acessar este chamado');
          } else {
            throw new Error('Erro ao buscar comentários do chamado');
          }
        }
        return response.json();
      })
      .then((data: DetalhesData) => {
        setComentarios(data.comentarios);
        setLoading(false);
        setError(null);
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
  }, [id, userParams.coduser]);

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
          codUser: userParams.coduser,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.mensagem || 'Erro ao adicionar comentário');
      }

      // Limpar campo e recarregar dados
      setNewComment('');
      fetchTicketDetails();
      setSubmitting(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao adicionar comentário');
      setSubmitting(false);
    }
  };

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando chamado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/cliente"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para meus chamados
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Erro ao carregar chamado</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!chamado) {
    return null;
  }

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link
        to="/cliente"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus chamados
      </Link>

      {/* Cabeçalho do Ticket */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-mono text-gray-500">Chamado #{chamado.codigo}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(chamado.prioridade.descricao)}`}>
                {chamado.prioridade.descricao}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                {chamado.categoria.descricao}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{chamado.titulo}</h1>
            <p className="text-gray-700 leading-relaxed">{chamado.descricao}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(chamado.status.descricao)}`}>
            {chamado.status.descricao}
          </span>
        </div>
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
            <div className="flex-1">
              <p className="text-xs text-gray-600">Responsável</p>
              <p className="font-medium text-gray-900 text-sm">
                {chamado.responsavel && chamado.responsavel.nome 
                  ? chamado.responsavel.nome 
                  : chamado.codUserResponsavel 
                    ? `Atribuído (ID: ${chamado.codUserResponsavel})` 
                    : 'Em análise'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expectativa de SLA */}
      {chamado.prioridade.sla && (
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Prazo de Resolução</p>
              <p className="text-sm text-blue-700 mt-1">
                O tempo previsto para resolução deste chamado é de <strong>{formatSLA(chamado.prioridade.sla)}</strong>. 
                Nossa equipe está trabalhando para resolver o mais rápido possível.
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
                Nossa equipe responderá em breve
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical da timeline */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {comentarios.map((comment, index) => {
                const isClient = comment.codUser === Number(userParams.coduser);

                return (
                  <div key={comment.codigo} className="relative flex gap-4 pb-6">
                    {/* Avatar com ícone */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      isClient 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
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
                          isClient 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isClient ? 'Cliente' : 'Suporte'}
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
        {submitError && (
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
        {(chamado.codStatus === 1 || chamado.codStatus === 2 || chamado.codStatus === 3) && (
          <form onSubmit={handleAddComment} className="space-y-3">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicionar Atualização
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione informações adicionais sobre o problema ou tire dúvidas com a equipe de suporte..."
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Adicionar Atualização
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {(chamado.codStatus === 6 || chamado.codStatus === 6) && (
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <p className="text-green-800 font-medium">
              Este chamado foi {chamado.codStatus === 6? 'resolvido' : 'fechado'}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Caso precise de ajuda adicional, abra um novo chamado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}