import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  totalComentarios: number;
}

interface Estatisticas {
  totalChamados: number;
  emAberto: number;
  resolvidos: number;
}

interface DashboardData {
  estatisticas: Estatisticas;
  chamados: Chamado[];
}

interface TechnicianDataContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const TechnicianDataContext = createContext<TechnicianDataContextType | undefined>(undefined);

export function TechnicianDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    
    // Técnicos precisam ver TODOS os chamados do sistema
    fetch('https://www.fitacabo.ddns.com.br/api/chamados/dashboard')
      .then((response) => {
        console.log('📊 Response status:', response.status);
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do dashboard');
        }
        return response.json();
      })
      .then((data: DashboardData) => {
        console.log('📊 Dashboard data recebido:', data);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Erro ao buscar dashboard:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <TechnicianDataContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      {children}
    </TechnicianDataContext.Provider>
  );
}

export function useTechnicianData() {
  const context = useContext(TechnicianDataContext);
  if (context === undefined) {
    throw new Error('useTechnicianData must be used within a TechnicianDataProvider');
  }
  return context;
}