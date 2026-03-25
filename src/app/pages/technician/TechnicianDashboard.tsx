import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket, Clock, CheckCircle2, AlertCircle, TrendingUp, Users, Loader2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';
import { useTechnicianData } from '../../contexts/TechnicianDataContext';

export function TechnicianDashboard() {
  const { data, loading, error } = useTechnicianData();

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
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

  // Dados para gráfico de status
  const statusData = chamados.reduce((acc, chamado) => {
    const status = acc.find(s => s.name === chamado.status.descricao);
    if (status) {
      status.quantidade++;
    } else {
      acc.push({ name: chamado.status.descricao, quantidade: 1 });
    }
    return acc;
  }, [] as { name: string, quantidade: number }[]);

  // Dados para gráfico de prioridades
  const priorityData = chamados.reduce((acc, chamado) => {
    const priority = acc.find(p => p.name === chamado.prioridade.descricao);
    if (priority) {
      priority.quantidade++;
    } else {
      acc.push({ name: chamado.prioridade.descricao, quantidade: 1 });
    }
    return acc;
  }, [] as { name: string, quantidade: number }[]);

  // Cores para o gráfico de pizza
  const COLORS = ['#6b7280', '#3b82f6', '#f97316', '#ef4444'];

  // Tickets urgentes (não atribuídos ou críticos)
  const urgentTickets = chamados
    .filter(t => (t.codUserResponsavel === null && t.codStatus === 1) || t.codPrioridade === 4)
    .sort((a, b) => b.codPrioridade - a.codPrioridade)
    .slice(0, 5);

  // Técnicos com mais chamados
  const technicianStats = chamados.reduce((acc, chamado) => {
    if (chamado.responsavel) {
      const tech = acc.find(t => t.nome === chamado.responsavel.nome);
      if (tech) {
        tech.total++;
        if (chamado.codStatus === 1 || chamado.codStatus === 2) {
          tech.ativos++;
        }
        if (chamado.codStatus === 4 || chamado.codStatus === 5) {
          tech.resolvidos++;
        }
      } else {
        acc.push({
          nome: chamado.responsavel.nome,
          ativos: chamado.codStatus === 1 || chamado.codStatus === 2 ? 1 : 0,
          resolvidos: chamado.codStatus === 4 || chamado.codStatus === 5 ? 1 : 0,
          total: 1,
        });
      }
    }
    return acc;
  }, [] as { nome: string, ativos: number, resolvidos: number, total: number }[]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Técnico</h2>
        <p className="text-gray-600 mt-1">Visão geral e métricas do sistema de chamados</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Chamados</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{estatisticas.totalChamados}</p>
              <p className="text-xs text-gray-500 mt-1">Todos os tickets</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Atendimento</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{estatisticas.emAberto}</p>
              <p className="text-xs text-gray-500 mt-1">Aguardando resolução</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolvidos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{estatisticas.resolvidos}</p>
              <p className="text-xs text-gray-500 mt-1">Concluídos com sucesso</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Críticos</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{urgentTickets.length}</p>
              <p className="text-xs text-gray-500 mt-1">Alta prioridade</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Chamados por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="quantidade" fill="#9333ea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Prioridades */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Prioridade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chamados Urgentes e Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chamados Urgentes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Chamados Urgentes
            </h3>
          </div>
          <div className="space-y-3">
            {urgentTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum chamado urgente</p>
            ) : (
              urgentTickets.map((ticket) => {
                return (
                  <Link
                    key={ticket.codigo}
                    to={`/tecnico/chamado/${ticket.codigo}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">#{ticket.codigo} - {ticket.titulo}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(ticket.dataCriacao)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status.descricao)}`}>
                          {ticket.status.descricao}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.prioridade.descricao)}`}>
                          {ticket.prioridade.descricao}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          <Link
            to="/tecnico/chamados"
            className="block mt-4 text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Ver todos os chamados →
          </Link>
        </div>

        {/* Performance dos Técnicos */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Performance da Equipe
            </h3>
          </div>
          <div className="space-y-4">
            {technicianStats.map((tech) => {
              const completionRate = tech.total > 0 
                ? ((tech.resolvidos / tech.total) * 100).toFixed(0)
                : 0;
              
              return (
                <div key={tech.nome} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{tech.nome}</p>
                      <p className="text-xs text-gray-600">
                        {tech.ativos} ativos • {tech.resolvidos} resolvidos
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}