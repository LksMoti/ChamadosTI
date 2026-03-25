import { Link, Outlet, useLocation } from 'react-router';
import { Home, Plus, Ticket, ArrowLeft } from 'lucide-react';

export function ClientLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/cliente') {
      return location.pathname === '/cliente';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: '/cliente', label: 'Meus Chamados', icon: Home },
    { to: '/cliente/novo-chamado', label: 'Novo Chamado', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Service Desk</h1>
                <p className="text-xs text-blue-600">Área do Cliente</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive(link.to)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Voltar para seleção de perfil */}
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden py-3 border-t border-gray-200 flex gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive(link.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
