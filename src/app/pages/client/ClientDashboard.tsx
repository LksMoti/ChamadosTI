import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Ticket, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useUserFromUrl } from '../../hooks/useUserFromUrl';

// Tipos baseados no response do endpoint
interface Estatisticas {
  totalChamados: number;
  emAberto: number;
  resolvidos: number;
}

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
  totalComentarios: number;
}

interface DashboardData {
  estatisticas: Estatisticas;
  chamados: Chamado[];
}

export function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pega parâmetros do usuário (da URL quando publicado, fixo por enquanto)
  const userParams = useUserFromUrl();

  useEffect(() => {
    // Buscar dados do endpoint
    fetch(`https://www.fitacabo.ddns.com.br/api/chamados/dashboard?coduser=${userParams.coduser}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do dashboard');
        }
        return response.json();
      })
      .then((data: DashboardData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userParams.coduser]);

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando seus chamados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Erro ao carregar dashboard</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { estatisticas, chamados } = data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m atrás`;
    }
  };

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
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Olá, {userParams.nome.split(' ')[0]}! 👋</h2>
        <p className="text-blue-100 text-lg">Bem-vindo ao seu painel de chamados</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Chamados</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{estatisticas.totalChamados}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Aberto</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{estatisticas.emAberto}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolvidos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{estatisticas.resolvidos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ação Rápida */}
      <Link
        to="/cliente/novo-chamado"
        className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Precisa de ajuda?</h3>
            <p className="text-blue-100">Abra um novo chamado e nossa equipe irá atendê-lo</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-8 h-8" />
          </div>
        </div>
      </Link>

      {/* Lista de Chamados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Meus Chamados</h3>
          <p className="text-sm text-gray-600 mt-1">Acompanhe o status dos seus tickets</p>
        </div>

        <div className="divide-y divide-gray-200">
          {chamados.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Você ainda não tem chamados</p>
              <Link
                to="/cliente/novo-chamado"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Criar meu primeiro chamado →
              </Link>
            </div>
          ) : (
            chamados
              .sort((a, b) => {
                const dateA = a.dataConclusao || a.dataCriacao;
                const dateB = b.dataConclusao || b.dataCriacao;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              })
              .map((chamado) => {
                return (
                  <Link
                    key={chamado.codigo}
                    to={`/cliente/chamado/${chamado.codigo}`}
                    state={{ chamado }}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Conteúdo Principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-gray-500">#{chamado.codigo}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(chamado.prioridade.descricao)}`}>
                            {chamado.prioridade.descricao}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            {chamado.categoria.descricao}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{chamado.titulo}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{chamado.descricao}</p>
                        
                        {/* Informações de Tempo */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {chamado.prioridade.sla && (
                            <div className="flex items-center gap-1.5 text-sm text-blue-600">
                              <Clock className="w-4 h-4" />
                              <span>Tempo de resposta {formatSLA(chamado.prioridade.sla)}</span>
                            </div>
                          )}
                          {chamado.horasEstimadas && (
                            <div className="flex items-center gap-1.5 text-sm text-purple-600">
                              <Clock className="w-4 h-4" />
                              <span>Tempo estimado {formatSLA(chamado.horasEstimadas)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status e Info */}
                      <div className="flex flex-col lg:items-end gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(chamado.status.descricao)}`}>
                          {chamado.status.descricao}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getTimeSince(chamado.dataConclusao || chamado.dataCriacao)}
                          </span>
                          {chamado.totalComentarios > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {chamado.totalComentarios}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}