export interface User {
  codigo: number;
  nome: string;
  email: string;
  departamentoId: number;
  role: 'Usuário' | 'Técnico' | 'Admin';
  ativo: boolean;
}

export interface Department {
  codigo: number;
  nome: string;
}

export interface TicketStatus {
  codigo: number;
  descricao: string;
  cor: string;
}

export interface TicketPriority {
  codigo: number;
  descricao: string;
  cor: string;
}

export interface TicketCategory {
  codigo: number;
  descricao: string;
}

export interface TicketComment {
  codigo: number;
  codigoChamado: number;
  codUser: number;
  comentario: string;
  data: string;
  interno: boolean;
}

export interface Ticket {
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
}

export const departments: Department[] = [
  { codigo: 1, nome: 'TI' },
  { codigo: 2, nome: 'RH' },
  { codigo: 3, nome: 'Financeiro' },
  { codigo: 4, nome: 'Vendas' },
];

export const users: User[] = [
  { codigo: 1, nome: 'João Silva', email: 'joao@empresa.com', departamentoId: 1, role: 'Admin', ativo: true },
  { codigo: 2, nome: 'Maria Santos', email: 'maria@empresa.com', departamentoId: 1, role: 'Técnico', ativo: true },
  { codigo: 3, nome: 'Pedro Costa', email: 'pedro@empresa.com', departamentoId: 2, role: 'Usuário', ativo: true },
  { codigo: 4, nome: 'Ana Paula', email: 'ana@empresa.com', departamentoId: 3, role: 'Usuário', ativo: true },
  { codigo: 5, nome: 'Carlos Mendes', email: 'carlos@empresa.com', departamentoId: 1, role: 'Técnico', ativo: true },
];

export const ticketStatuses: TicketStatus[] = [
  { codigo: 1, descricao: 'Aberto', cor: 'bg-blue-100 text-blue-800' },
  { codigo: 2, descricao: 'Em Atendimento', cor: 'bg-yellow-100 text-yellow-800' },
  { codigo: 3, descricao: 'Aguardando Usuário', cor: 'bg-orange-100 text-orange-800' },
  { codigo: 4, descricao: 'Resolvido', cor: 'bg-green-100 text-green-800' },
  { codigo: 5, descricao: 'Fechado', cor: 'bg-gray-100 text-gray-800' },
];

export const ticketPriorities: TicketPriority[] = [
  { codigo: 1, descricao: 'Baixa', cor: 'bg-gray-100 text-gray-800' },
  { codigo: 2, descricao: 'Média', cor: 'bg-blue-100 text-blue-800' },
  { codigo: 3, descricao: 'Alta', cor: 'bg-orange-100 text-orange-800' },
  { codigo: 4, descricao: 'Crítica', cor: 'bg-red-100 text-red-800' },
];

export const ticketCategories: TicketCategory[] = [
  { codigo: 1, descricao: 'Hardware' },
  { codigo: 2, descricao: 'Software' },
  { codigo: 3, descricao: 'Rede' },
  { codigo: 4, descricao: 'Acesso' },
  { codigo: 5, descricao: 'Sistemas' },
];

export const tickets: Ticket[] = [
  {
    codigo: 1,
    titulo: 'Computador não liga',
    descricao: 'Meu computador não está ligando. Tentei várias vezes mas não funciona.',
    codStatus: 2,
    codPrioridade: 3,
    codCategoria: 1,
    codUser: 3,
    codUserResponsavel: 2,
    dataCriacao: '2026-03-19T09:30:00',
    dataConclusao: null,
    horasEstimadas: 4.0,
  },
  {
    codigo: 2,
    titulo: 'Problema no acesso ao sistema',
    descricao: 'Não consigo acessar o sistema de folha de pagamento. Aparece erro de autenticação.',
    codStatus: 1,
    codPrioridade: 2,
    codCategoria: 4,
    codUser: 4,
    codUserResponsavel: null,
    dataCriacao: '2026-03-20T08:15:00',
    dataConclusao: null,
    horasEstimadas: null,
  },
  {
    codigo: 3,
    titulo: 'Internet lenta',
    descricao: 'A internet está muito lenta hoje. Não consigo acessar os sites.',
    codStatus: 4,
    codPrioridade: 1,
    codCategoria: 3,
    codUser: 3,
    codUserResponsavel: 5,
    dataCriacao: '2026-03-18T11:00:00',
    dataConclusao: '2026-03-19T16:45:00',
    horasEstimadas: 2.5,
  },
  {
    codigo: 4,
    titulo: 'Instalação de software',
    descricao: 'Preciso instalar o Adobe Acrobat Pro na minha máquina.',
    codStatus: 2,
    codPrioridade: 1,
    codCategoria: 2,
    codUser: 4,
    codUserResponsavel: 2,
    dataCriacao: '2026-03-19T13:20:00',
    dataConclusao: null,
    horasEstimadas: 1.0,
  },
  {
    codigo: 5,
    titulo: 'Servidor de email fora do ar',
    descricao: 'O servidor de email está fora do ar. Ninguém consegue enviar ou receber emails.',
    codStatus: 2,
    codPrioridade: 4,
    codCategoria: 5,
    codUser: 3,
    codUserResponsavel: 5,
    dataCriacao: '2026-03-20T07:00:00',
    dataConclusao: null,
    horasEstimadas: 8.0,
  },
  {
    codigo: 6,
    titulo: 'Reset de senha',
    descricao: 'Esqueci minha senha do sistema. Preciso resetar.',
    codStatus: 4,
    codPrioridade: 2,
    codCategoria: 4,
    codUser: 4,
    codUserResponsavel: 2,
    dataCriacao: '2026-03-19T10:00:00',
    dataConclusao: '2026-03-19T10:30:00',
    horasEstimadas: 0.5,
  },
];

export const ticketComments: TicketComment[] = [
  {
    codigo: 1,
    codigoChamado: 1,
    codUser: 2,
    comentario: 'Vou verificar o problema. Pode me informar o modelo do computador?',
    data: '2026-03-19T10:00:00',
    interno: false,
  },
  {
    codigo: 2,
    codigoChamado: 1,
    codUser: 3,
    comentario: 'É um Dell Inspiron 15.',
    data: '2026-03-19T10:15:00',
    interno: false,
  },
  {
    codigo: 3,
    codigoChamado: 1,
    codUser: 2,
    comentario: 'Verifiquei que é problema na fonte. Vou trocar.',
    data: '2026-03-19T14:20:00',
    interno: true,
  },
  {
    codigo: 4,
    codigoChamado: 5,
    codUser: 5,
    comentario: 'Identificado problema no servidor. Trabalhando na solução.',
    data: '2026-03-20T07:05:00',
    interno: false,
  },
];

export const getStatusById = (codigo: number) => ticketStatuses.find(s => s.codigo === codigo);
export const getPriorityById = (codigo: number) => ticketPriorities.find(p => p.codigo === codigo);
export const getCategoryById = (codigo: number) => ticketCategories.find(c => c.codigo === codigo);
export const getUserById = (codigo: number) => users.find(u => u.codigo === codigo);
export const getTicketById = (codigo: number) => tickets.find(t => t.codigo === codigo);
export const getCommentsByTicketId = (codigoChamado: number) => ticketComments.filter(c => c.codigoChamado === codigoChamado);