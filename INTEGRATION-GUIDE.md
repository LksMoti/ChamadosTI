# 🔌 Guia de Integração Frontend → Backend

Este documento mapeia exatamente **o que cada página do sistema precisa** da API.

**Estrutura do Banco de Dados:**
- `TblChamados` - Tabela principal de chamados (campos: Codigo, Titulo, Descricao, CodStatus, CodPrioridade, CodCategoria, CodUser, CodUserResponsavel, DataCriacao, DataConclusao, HorasEstimadas)
- `TblChamadoStatus` - Status dos chamados (campos: Codigo, Descricao)
- `TblPrioridadeChamado` - Prioridades (campos: Codigo, Descricao)
- `TblCategoriaChamado` - Categorias (campos: Codigo, Descricao)
- `TblComentariosChamdo` - Comentários (campos: Codigo, CodigoChamado, CodUser, Comentario, Data, Interno)

---

## 📱 ÁREA DO CLIENTE (`/cliente/*`)

### 1. **Dashboard do Cliente** (`/cliente`)

**Página:** `ClientDashboard.tsx`

**Dados Necessários:**

1. **Estatísticas do usuário**
   ```typescript
   GET /api/dashboard/stats
   ```
   
   **Retorna:**
   - Total de chamados
   - Chamados em aberto
   - Chamados resolvidos

2. **Lista de chamados do usuário**
   ```typescript
   GET /api/tickets?page=1&pageSize=50
   ```
   
   **Retorna:**
   - Lista de todos os chamados criados pelo usuário
   - Inclui status, prioridade, categoria
   - Total de comentários por chamado
   - Última atualização

**Resumo de Chamadas:**
```typescript
// Ao carregar a página
useEffect(() => {
  // 1. Buscar estatísticas
  fetch('/api/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // 2. Buscar lista de chamados
  fetch('/api/tickets?page=1&pageSize=50', {
    headers: { Authorization: `Bearer ${token}` }
  });
}, []);
```

---

### 2. **Criar Novo Chamado** (`/cliente/novo-chamado`)

**Página:** `ClientNewTicket.tsx`

**Dados Necessários:**

1. **Listas de seleção (ao carregar a página)**
   ```typescript
   GET /api/lookups/categorias
   GET /api/lookups/prioridades
   ```

2. **Criar o chamado (ao submeter formulário)**
   ```typescript
   POST /api/tickets
   
   Body: {
     "titulo": "...",
     "descricao": "...",
     "codCategoria": 4,
     "codPrioridade": 2
   }
   ```

**Resumo de Chamadas:**
```typescript
// Ao carregar a página
useEffect(() => {
  fetch('/api/lookups/categorias');
  fetch('/api/lookups/prioridades');
}, []);

// Ao submeter formulário
const handleSubmit = async (formData) => {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  
  if (response.ok) {
    navigate('/cliente');
  }
};
```

---

### 3. **Detalhes do Chamado** (`/cliente/chamado/:id`)

**Página:** `ClientTicketDetails.tsx`

**Dados Necessários:**

1. **Detalhes completos do chamado**
   ```typescript
   GET /api/tickets/{id}
   ```
   
   **Retorna:**
   - Informações completas do ticket
   - Status, prioridade, categoria
   - Responsável (se houver)
   - Lista de comentários (apenas públicos, `interno: false`)
   - Datas de criação/atualização

2. **Adicionar comentário**
   ```typescript
   POST /api/tickets/{id}/comentarios
   
   Body: {
     "comentario": "Obrigado pela ajuda!"
   }
   ```

**Resumo de Chamadas:**
```typescript
// Ao carregar a página
useEffect(() => {
  fetch(`/api/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}, [id]);

// Ao adicionar comentário
const handleAddComment = async (texto) => {
  await fetch(`/api/tickets/${id}/comentarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ comentario: texto })
  });
  
  // Recarregar detalhes para atualizar lista de comentários
  fetch(`/api/tickets/${id}`);
};
```

---

## 🔧 ÁREA DO TÉCNICO (`/tecnico/*`)

### 4. **Dashboard Técnico** (`/tecnico`)

**Página:** `TechnicianDashboard.tsx`

**Dados Necessários:**

1. **Estatísticas gerais e métricas**
   ```typescript
   GET /api/dashboard/stats
   ```
   
   **Retorna (para técnico/admin):**
   - Total de chamados
   - Chamados em aberto
   - Chamados em atendimento
   - Resolvidos
   - Críticos
   - Distribuição por status (para gráfico de barras)
   - Distribuição por prioridade (para gráfico de pizza)
   - Performance dos técnicos
   - Lista de chamados urgentes

**Resumo de Chamadas:**
```typescript
// Ao carregar a página
useEffect(() => {
  fetch('/api/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
}, []);
```

**Obs:** Um único endpoint retorna TODOS os dados necessários para o dashboard.

---

### 5. **Lista de Todos os Chamados** (`/tecnico/chamados`)

**Página:** `TechnicianTickets.tsx`

**Dados Necessários:**

1. **Listas de filtros (ao carregar)**
   ```typescript
   GET /api/lookups/statuses
   GET /api/lookups/prioridades
   GET /api/lookups/categorias
   ```

2. **Lista de chamados (com filtros aplicados)**
   ```typescript
   GET /api/tickets?page=1&pageSize=20&status=2&prioridade=3&search=impressora
   ```

**Resumo de Chamadas:**
```typescript
// Ao carregar a página
useEffect(() => {
  fetch('/api/lookups/statuses');
  fetch('/api/lookups/prioridades');
  fetch('/api/lookups/categorias');
}, []);

// Sempre que os filtros mudarem
useEffect(() => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: '20',
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(priorityFilter !== 'all' && { prioridade: priorityFilter }),
    ...(categoryFilter !== 'all' && { categoria: categoryFilter }),
    ...(searchTerm && { search: searchTerm })
  });
  
  fetch(`/api/tickets?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}, [page, statusFilter, priorityFilter, categoryFilter, searchTerm]);
```

---

### 6. **Detalhes do Chamado (Técnico)** (`/tecnico/chamado/:id`)

**Página:** `TechnicianTicketDetails.tsx`

**Dados Necessários:**

1. **Detalhes completos do chamado**
   ```typescript
   GET /api/tickets/{id}
   ```
   
   **Retorna:**
   - Todas as informações do ticket
   - Comentários (incluindo notas internas, `interno: true`)

2. **Lista de técnicos (para atribuição)**
   ```typescript
   GET /api/lookups/tecnicos
   ```

3. **Listas para edição**
   ```typescript
   GET /api/lookups/statuses
   GET /api/lookups/prioridades
   ```

4. **Atualizar chamado**
   ```typescript
   PATCH /api/tickets/{id}
   
   Body: {
     "codStatus": 2,
     "codPrioridade": 3,
     "codUserResponsavel": 5,
     "horasEstimadas": 6.5
   }
   ```

5. **Adicionar comentário (público ou interno)**
   ```typescript
   POST /api/tickets/{id}/comentarios
   
   Body: {
     "comentario": "Problema resolvido...",
     "interno": false
   }
   ```

**Resumo de Chamadas:**
```typescript
// Ao carregar a página
useEffect(() => {
  fetch(`/api/tickets/${id}`);
  fetch('/api/lookups/tecnicos');
  fetch('/api/lookups/statuses');
  fetch('/api/lookups/prioridades');
}, [id]);

// Ao atualizar chamado
const handleUpdate = async (dados) => {
  await fetch(`/api/tickets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(dados)
  });
  
  // Recarregar detalhes
  fetch(`/api/tickets/${id}`);
};

// Ao adicionar comentário
const handleAddComment = async (texto, isInternal) => {
  await fetch(`/api/tickets/${id}/comentarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      comentario: texto,
      interno: isInternal
    })
  });
  
  // Recarregar detalhes
  fetch(`/api/tickets/${id}`);
};
```

---

## 🔐 AUTENTICAÇÃO

### 7. **Seletor de Perfil / Login** (`/`)

**Página:** `ProfileSelector.tsx`

**Dados Necessários:**

1. **Login do usuário**
   ```typescript
   POST /api/auth/login
   
   Body: {
     "email": "usuario@empresa.com",
     "senha": "senha123"
   }
   ```
   
   **Retorna:**
   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "codigo": 3,
       "nome": "Pedro Costa",
       "email": "pedro@empresa.com",
       "role": "Usuário"
     }
   }
   ```

2. **Armazenar token e redirecionar baseado no role**
   ```typescript
   localStorage.setItem('token', data.token);
   localStorage.setItem('user', JSON.stringify(data.user));
   
   if (data.user.role === 'Usuário') {
     navigate('/cliente');
   } else {
     navigate('/tecnico');
   }
   ```

---

## 📊 Resumo Total de Endpoints por Página

| Página | Endpoint(s) Necessário(s) |
|--------|---------------------------|
| **Login** | `POST /api/auth/login` |
| **Dashboard Cliente** | `GET /api/dashboard/stats`<br>`GET /api/tickets` |
| **Novo Chamado** | `GET /api/lookups/categorias`<br>`GET /api/lookups/prioridades`<br>`POST /api/tickets` |
| **Detalhes Chamado (Cliente)** | `GET /api/tickets/{id}`<br>`POST /api/tickets/{id}/comentarios` |
| **Dashboard Técnico** | `GET /api/dashboard/stats` |
| **Lista Chamados (Técnico)** | `GET /api/lookups/statuses`<br>`GET /api/lookups/prioridades`<br>`GET /api/lookups/categorias`<br>`GET /api/tickets` (com filtros) |
| **Detalhes Chamado (Técnico)** | `GET /api/tickets/{id}`<br>`GET /api/lookups/tecnicos`<br>`GET /api/lookups/statuses`<br>`GET /api/lookups/prioridades`<br>`PATCH /api/tickets/{id}`<br>`POST /api/tickets/{id}/comentarios` |

---

## 🎯 Endpoints Mais Importantes

### **Top 5 Endpoints Críticos:**

1. **`GET /api/tickets`** - Lista de chamados (usado em 3 páginas)
2. **`GET /api/tickets/{id}`** - Detalhes do chamado (usado em 2 páginas)
3. **`GET /api/dashboard/stats`** - Dashboard (usado em 2 páginas)
4. **`POST /api/tickets`** - Criar chamado
5. **`POST /api/tickets/{id}/comentarios`** - Adicionar comentário

### **Endpoints de Lookup (Cache-friendly):**
- `/api/lookups/statuses`
- `/api/lookups/prioridades`
- `/api/lookups/categorias`
- `/api/lookups/tecnicos`

💡 **Dica:** Estes endpoints retornam dados estáticos. Você pode fazer cache no frontend (localStorage ou React Query) para evitar chamadas repetidas.

---

## 🔄 Fluxo de Dados Típico

### **Usuário Cliente:**
```
1. Login → POST /api/auth/login
2. Dashboard → GET /api/dashboard/stats + GET /api/tickets
3. Ver chamado → GET /api/tickets/{id}
4. Comentar → POST /api/tickets/{id}/comentarios
5. Criar chamado → POST /api/tickets
```

### **Técnico:**
```
1. Login → POST /api/auth/login
2. Dashboard → GET /api/dashboard/stats
3. Ver todos → GET /api/tickets (com filtros)
4. Abrir chamado → GET /api/tickets/{id}
5. Atribuir/Atualizar → PATCH /api/tickets/{id}
6. Comentar/Nota interna → POST /api/tickets/{id}/comentarios
```

---

## 💡 Dicas de Implementação

### 1. **Criar um serviço de API centralizado**

```typescript
// services/api.ts
const API_BASE_URL = 'https://api.seuservicedesk.com/api';

export const api = {
  // Tickets
  getTickets: (params) => 
    fetch(`${API_BASE_URL}/tickets?${new URLSearchParams(params)}`),
  
  getTicketById: (id) => 
    fetch(`${API_BASE_URL}/tickets/${id}`),
  
  createTicket: (data) => 
    fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  updateTicket: (id, data) =>
    fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  
  // Comentários
  addComment: (ticketId, data) =>
    fetch(`${API_BASE_URL}/tickets/${ticketId}/comentarios`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // Dashboard
  getDashboardStats: () =>
    fetch(`${API_BASE_URL}/dashboard/stats`),
  
  // Lookups
  getStatuses: () => fetch(`${API_BASE_URL}/lookups/statuses`),
  getPriorities: () => fetch(`${API_BASE_URL}/lookups/prioridades`),
  getCategories: () => fetch(`${API_BASE_URL}/lookups/categorias`),
  getTechnicians: () => fetch(`${API_BASE_URL}/lookups/tecnicos`),
  
  // Auth
  login: (credentials) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
};
```

### 2. **Usar React Query para cache e sincronização**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook para buscar tickets
export function useTickets(filters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => api.getTickets(filters)
  });
}

// Hook para buscar detalhes
export function useTicket(id) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicketById(id)
  });
}

// Hook para criar ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  });
}
```

### 3. **Interceptor para autenticação**

```typescript
// Adicionar token automaticamente
fetch.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ✅ Checklist de Implementação

- [ ] Implementar serviço de API centralizado
- [ ] Configurar interceptor de autenticação
- [ ] Adicionar tratamento de erros global
- [ ] Implementar React Query para cache
- [ ] Fazer cache de lookups (statuses, prioridades, categorias)
- [ ] Adicionar loading states
- [ ] Implementar retry automático em caso de erro
- [ ] Validar respostas da API
- [ ] Tratar tokens expirados (refresh token)

---

**Conclusão:** Com estes endpoints, seu sistema está completo e funcional. Não há necessidade de criar "mil endpoints" - apenas **15 endpoints** cobrem toda a aplicação! 🚀