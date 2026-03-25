import { Link } from 'react-router';
import { Home, AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            Voltar para o Início
          </Link>

          <div className="flex gap-3">
            <Link
              to="/cliente"
              className="flex-1 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold border border-blue-200"
            >
              Área do Cliente
            </Link>
            <Link
              to="/tecnico"
              className="flex-1 px-6 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-semibold border border-purple-200"
            >
              Área do Técnico
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Se você acredita que isso é um erro, entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
