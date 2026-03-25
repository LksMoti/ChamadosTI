import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useUserFromUrl } from '../../hooks/useUserFromUrl';

// Tipos baseados no response dos endpoints
interface Categoria {
  codigo: number;
  descricao: string;
}

interface Prioridade {
  codigo: number;
  descricao: string;
  sla?: number;
}

interface OpcoesData {
  categorias: Categoria[];
  prioridades: Prioridade[];
}

export function ClientNewTicket() {
  const navigate = useNavigate();
  const userParams = useUserFromUrl(); // Pega coduser da URL
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    codCategoria: '',
    codPrioridade: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [opcoes, setOpcoes] = useState<OpcoesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Buscar categorias e prioridades ao carregar a página
  useEffect(() => {
    fetch('https://www.fitacabo.ddns.com.br/api/chamados/opcoes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar opções');
        }
        return response.json();
      })
      .then((data: OpcoesData) => {
        setOpcoes(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'O título é obrigatório';
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'O título deve ter pelo menos 5 caracteres';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'A descrição é obrigatória';
    } else if (formData.descricao.trim().length < 10) {
      newErrors.descricao = 'A descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.codCategoria) {
      newErrors.categoriaId = 'Selecione uma categoria';
    }

    if (!formData.codPrioridade) {
      newErrors.prioridadeId = 'Selecione uma prioridade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('https://www.fitacabo.ddns.com.br/api/chamados/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim(),
          codCategoria: Number(formData.codCategoria),
          codPrioridade: Number(formData.codPrioridade),
          codUser: Number(userParams.coduser), // Usa o codUser da URL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Tratar erros de validação do backend
        if (data.erros) {
          setErrors(data.erros);
        } else {
          throw new Error(data.mensagem || 'Erro ao criar chamado');
        }
        setSubmitting(false);
        return;
      }

      // Sucesso - redirecionar para o dashboard
      navigate('/cliente');
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Erro ao criar chamado' });
      setSubmitting(false);
    }
  };

  // Estado de carregamento das opções
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  // Estado de erro ao carregar opções
  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Erro ao carregar formulário</p>
          <p className="text-red-600 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!opcoes) {
    return null;
  }

  const selectedPriority = formData.codPrioridade 
    ? opcoes.prioridades.find(p => p.codigo === Number(formData.codPrioridade))
    : null;

  const formatSLA = (hours: number) => {
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Link
        to="/cliente"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus chamados
      </Link>

      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Abrir Novo Chamado</h2>
        <p className="text-blue-100">Descreva seu problema e nossa equipe irá ajudá-lo</p>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Dica para um atendimento mais rápido</p>
            <p className="text-sm text-blue-700 mt-1">
              Seja o mais detalhado possível na descrição do problema. Inclua informações como: quando começou, 
              mensagens de erro que apareceram, e o que você já tentou fazer.
            </p>
          </div>
        </div>
      </div>

      {/* Erro de Submit */}
      {errors.submit && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Erro ao enviar chamado</p>
              <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Chamado */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="space-y-5">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título do Problema <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ex: Meu computador não está ligando"
                disabled={submitting}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.titulo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.titulo && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.titulo}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                rows={6}
                disabled={submitting}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.descricao ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.descricao && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.descricao}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {formData.descricao.length} caracteres
              </p>
            </div>

            {/* Categoria e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Categoria */}
              <div>
                <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoriaId"
                  name="codCategoria"
                  value={formData.codCategoria}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.categoriaId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  {opcoes.categorias.map(category => (
                    <option key={category.codigo} value={category.codigo}>
                      {category.descricao}
                    </option>
                  ))}
                </select>
                {errors.categoriaId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.categoriaId}
                  </p>
                )}
              </div>

              {/* Prioridade */}
              <div>
                <label htmlFor="prioridadeId" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgência <span className="text-red-500">*</span>
                </label>
                <select
                  id="prioridadeId"
                  name="codPrioridade"
                  value={formData.codPrioridade}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.prioridadeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione a urgência</option>
                  {opcoes.prioridades.map(priority => (
                    <option key={priority.codigo} value={priority.codigo}>
                      {priority.descricao}
                    </option>
                  ))}
                </select>
                {errors.prioridadeId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.prioridadeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informações sobre SLA */}
        {selectedPriority && (
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Tempo de Atendimento</p>
                <p className="text-sm text-green-700 mt-1">
                  Para a prioridade <strong>{selectedPriority.descricao}</strong>
                  {selectedPriority.sla && (
                    <>, o prazo previsto para resolução é de <strong>{formatSLA(selectedPriority.sla)}</strong></>
                  )}
                  . Nossa equipe fará o possível para resolver seu problema o mais rápido possível.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Chamado
              </>
            )}
          </button>
          <Link
            to="/cliente"
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold ${
              submitting ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}