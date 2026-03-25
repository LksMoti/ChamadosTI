import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Clock, User, Tag, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { useTechnicianData } from '../../contexts/TechnicianDataContext';

export function TechnicianTickets() {
  const { data, loading, error } = useTechnicianData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando chamados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Erro ao carregar chamados</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { chamados } = data;

  // Extrair listas únicas de status, prioridades e categorias dos chamados
  const statusList = Array.from(new Set(chamados.map(c => JSON.stringify({ codigo: c.status.codigo, descricao: c.status.descricao }))))
    .map(s => JSON.parse(s));
  
  const priorityList = Array.from(new Set(chamados.map(c => JSON.stringify({ codigo: c.prioridade.codigo, descricao: c.prioridade.descricao }))))
    .map(p => JSON.parse(p));
  
  const categoryList = Array.from(new Set(chamados.map(c => JSON.stringify({ codigo: c.categoria.codigo, descricao: c.categoria.descricao }))))
    .map(c => JSON.parse(c));

  // Filtrar tickets
  const filteredTickets = chamados.filter(ticket => {
    const matchesSearch = 
      ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.codigo.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ticket.codStatus.toString() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.codPrioridade.toString() === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.codCategoria.toString() === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Ordenar por prioridade (crítico primeiro) e depois por data
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (b.codPrioridade !== a.codPrioridade) {
      return b.codPrioridade - a.codPrioridade;
    }
    return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
  });

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
        <h2 className="text-3xl font-bold text-gray-900">Todos os Chamados</h2>
        <p className="text-gray-600 mt-1">Gerencie e atribua chamados da equipe</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todos os Status</option>
              {statusList.map(status => (
                <option key={status.codigo} value={status.codigo}>
                  {status.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Prioridade */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todas as Prioridades</option>
              {priorityList.map(priority => (
                <option key={priority.codigo} value={priority.codigo}>
                  {priority.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todas as Categorias</option>
              {categoryList.map(category => (
                <option key={category.codigo} value={category.codigo}>
                  {category.descricao}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{filteredTickets.length}</span> de{' '}
            <span className="font-medium">{chamados.length}</span> chamados
          </div>
          {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="space-y-4">
        {sortedTickets.length === 0 ? (
          <div className="bg-white rounded-xl p-16 border border-gray-200 shadow-sm text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum chamado encontrado</h3>
              <p className="text-gray-500 text-sm">Tente ajustar os filtros para encontrar o que procura</p>
            </div>
          </div>
        ) : (
          sortedTickets.map((ticket) => {
            const status = statusList.find(s => s.codigo === ticket.codStatus);
            const priority = priorityList.find(p => p.codigo === ticket.codPrioridade);
            const category = categoryList.find(c => c.codigo === ticket.codCategoria);
            const isUnassigned = ticket.codUserResponsavel === null;

            return (
              <Link
                key={ticket.codigo}
                to={`/tecnico/chamado/${ticket.codigo}`}
                className="group block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Coluna Esquerda - ID e Status */}
                  <div className="flex flex-col gap-3 lg:w-40 flex-shrink-0">
                    {/* ID do Chamado */}
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-purple-700">#{ticket.codigo}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-500">Chamado</span>
                        <span className="font-mono text-sm font-semibold text-gray-900">ID {ticket.codigo}</span>
                      </div>
                    </div>

                    {/* Badge de Status */}
                    <span className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold ${getStatusColor(status?.descricao)}`}>
                      {status?.descricao}
                    </span>
                  </div>

                  {/* Coluna Central - Conteúdo Principal */}
                  <div className="flex-1 min-w-0">
                    {/* Badges de Prioridade e Categoria */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold ${getPriorityColor(priority?.descricao)}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {priority?.descricao}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        {category?.descricao}
                      </span>
                      {isUnassigned && (
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-semibold">
                          <User className="w-3.5 h-3.5" />
                          Não atribuído
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                      {ticket.titulo}
                    </h3>

                    {/* Descrição */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {ticket.descricao}
                    </p>

                    {/* Informações em Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Responsável */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Responsável</p>
                          <p className="font-medium text-gray-900 truncate">
                            {ticket.responsavel ? ticket.responsavel.nome : 'Aguardando'}
                          </p>
                        </div>
                      </div>

                      {/* Tempo */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Criado</p>
                          <p className="font-medium text-gray-900">{getTimeSince(ticket.dataCriacao)}</p>
                        </div>
                      </div>

                      {/* Comentários */}
                      {ticket.totalComentarios > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Comentários</p>
                            <p className="font-medium text-gray-900">
                              {ticket.totalComentarios} {ticket.totalComentarios === 1 ? 'comentário' : 'comentários'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Indicador Visual de Hover */}
                  <div className="hidden lg:flex items-center">
                    <div className="w-1 h-20 bg-gray-200 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}