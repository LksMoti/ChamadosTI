import { Link, useLocation } from 'react-router';
import { User, Wrench, Ticket, Lock } from 'lucide-react';

export function ProfileSelector() {
  const { search } = useLocation();
  const codsetor = new URLSearchParams(search).get('codsetor');
  const isTechnician = codsetor === '35';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo e Título */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
            <Ticket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Service Desk</h1>
          <p className="text-xl text-gray-600">Sistema de Chamados TI</p>
        </div>

        {/* Seleção de Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Cliente */}
          <Link
            to={`/cliente${search}`}
            className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Área do Cliente</h2>
                <p className="text-gray-600">
                  Abra novos chamados e acompanhe o andamento dos seus tickets
                </p>
              </div>
              <div className="w-full pt-4 border-t border-gray-200">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Criar chamados
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Acompanhar status
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Enviar mensagens
                  </li>
                </ul>
              </div>
              <div className="w-full pt-4">
                <span className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold group-hover:bg-blue-700 transition-colors">
                  Acessar como Cliente
                </span>
              </div>
            </div>
          </Link>

          {/* Card Técnico */}
          {isTechnician ? (
            <Link
              to={`/tecnico${search}`}
              className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Área do Técnico</h2>
                  <p className="text-gray-600">
                    Gerencie chamados, atribua responsáveis e resolva problemas
                  </p>
                </div>
                <div className="w-full pt-4 border-t border-gray-200">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Dashboard completo
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Gerenciar todos os chamados
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Estatísticas e métricas
                    </li>
                  </ul>
                </div>
                <div className="w-full pt-4">
                  <span className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold group-hover:bg-purple-700 transition-colors">
                    Acessar como Técnico
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 opacity-50 cursor-not-allowed">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <Lock className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-500 mb-2">Área do Técnico</h2>
                  <p className="text-gray-400">
                    Acesso restrito ao setor de TI
                  </p>
                </div>
                <div className="w-full pt-4">
                  <span className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold">
                    Sem permissão de acesso
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informação adicional */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Sistema de gerenciamento de chamados de TI | Service Desk 2026
          </p>
        </div>
      </div>
    </div>
  );
}
