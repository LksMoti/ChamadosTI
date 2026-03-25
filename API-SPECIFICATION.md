# 📋 Especificação da API - Service Desk

## 🎯 Visão Geral

Esta especificação define uma API RESTful **limpa e consolidada** para o sistema de Service Desk, focando em endpoints bem estruturados que atendem tanto a área do cliente quanto a área do técnico.

**Princípios desta API:**
- ✅ Endpoints consolidados (sem duplicação)
- ✅ RESTful seguindo boas práticas
- ✅ Autorização baseada em roles (User, Técnico, Admin)
- ✅ Respostas consistentes
- ✅ Paginação quando necessário

**Estrutura do Banco de Dados:**
- `TblChamados` - Tabela principal de chamados
- `TblChamadoStatus` - Status dos chamados
- `TblPrioridadeChamado` - Prioridades
- `TblCategoriaChamado` - Categorias
- `TblComentariosChamdo` - Comentários dos chamados

---

## 🔐 Autenticação

Todos os endpoints (exceto login/registro) requerem autenticação via **JWT Bearer Token**.

### Headers Obrigatórios
```http
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📦 Endpoints da API

### 1️⃣ **AUTENTICAÇÃO**

#### `POST /api/auth/login`
Autenticar usuário e obter token JWT.

**Request:**
```json
{
  "email": "joao@empresa.com",
  "senha": "senha123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "codigo": 1,
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "role": "Admin",
    "departamentoId": 1
  }
}
```

#### `POST /api/auth/refresh`
Renovar token JWT expirado.

**Request:**
```json
{
  "refreshToken": "..."
}
```

---

### 2️⃣ **CHAMADOS (TICKETS)**

#### `GET /api/tickets`
Listar chamados (com filtros e paginação).

**Query Parameters:**
- `page` (int, default: 1) - Página atual
- `pageSize` (int, default: 20) - Itens por página
- `status` (int, opcional) - Filtrar por codStatus
- `prioridade` (int, opcional) - Filtrar por codPrioridade
- `categoria` (int, opcional) - Filtrar por codCategoria
- `criadoPor` (int, opcional) - Filtrar por usuário que criou (codUser)
- `responsavel` (int, opcional) - Filtrar por técnico responsável (codUserResponsavel)
- `search` (string, opcional) - Buscar por título/descrição

**Comportamento por Role:**
- **User**: Retorna apenas chamados criados por ele (`codUser = userId`)
- **Técnico/Admin**: Retorna todos os chamados (com possibilidade de filtros)

**Response 200:**
```json
{
  "data": [
    {
      "codigo": 1,
      "titulo": "Computador não liga",
      "descricao": "Meu computador não está ligando...",
      "codStatus": 2,
      "codPrioridade": 3,
      "codCategoria": 1,
      "codUser": 3,
      "codUserResponsavel": 2,
      "dataCriacao": "2026-03-19T09:30:00Z",
      "dataConclusao": null,
      "horasEstimadas": 4.0,
      "status": {
        "codigo": 2,
        "descricao": "Em Atendimento"
      },
      "prioridade": {
        "codigo": 3,
        "descricao": "Alta"
      },
      "categoria": {
        "codigo": 1,
        "descricao": "Hardware"
      },
      "criadoPor": {
        "codigo": 3,
        "nome": "Pedro Costa",
        "email": "pedro@empresa.com"
      },
      "responsavel": {
        "codigo": 2,
        "nome": "Maria Santos",
        "email": "maria@empresa.com"
      },
      "totalComentarios": 3
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

---

#### `GET /api/tickets/{id}`
Obter detalhes de um chamado específico.

**Comportamento por Role:**
- **User**: Só pode ver chamados criados por ele
- **Técnico/Admin**: Pode ver qualquer chamado

**Response 200:**
```json
{
  "codigo": 1,
  "titulo": "Computador não liga",
  "descricao": "Meu computador não está ligando. Tentei várias vezes mas não funciona.",
  "codStatus": 2,
  "codPrioridade": 3,
  "codCategoria": 1,
  "codUser": 3,
  "codUserResponsavel": 2,
  "dataCriacao": "2026-03-19T09:30:00Z",
  "dataConclusao": null,
  "horasEstimadas": 4.0,
  "status": {
    "codigo": 2,
    "descricao": "Em Atendimento"
  },
  "prioridade": {
    "codigo": 3,
    "descricao": "Alta"
  },
  "categoria": {
    "codigo": 1,
    "descricao": "Hardware"
  },
  "criadoPor": {
    "codigo": 3,
    "nome": "Pedro Costa",
    "email": "pedro@empresa.com",
    "departamento": "RH"
  },
  "responsavel": {
    "codigo": 2,
    "nome": "Maria Santos",
    "email": "maria@empresa.com"
  },
  "comentarios": [
    {
      "codigo": 1,
      "codigoChamado": 1,
      "codUser": 2,
      "comentario": "Vou verificar o problema...",
      "data": "2026-03-19T10:00:00Z",
      "interno": false,
      "usuario": {
        "codigo": 2,
        "nome": "Maria Santos",
        "role": "Técnico"
      }
    }
  ]
}
```

**Response 403** (se User tentar ver chamado de outro):
```json
{
  "error": "Acesso negado. Você não tem permissão para visualizar este chamado."
}
```

**Response 404:**
```json
{
  "error": "Chamado não encontrado."
}
```

---

#### `POST /api/tickets`
Criar um novo chamado.

**Permissões:** Todos os usuários autenticados

**Request:**
```json
{
  "titulo": "Problema no acesso ao sistema",
  "descricao": "Não consigo acessar o sistema de folha...",
  "codCategoria": 4,
  "codPrioridade": 2
}
```

**Response 201:**
```json
{
  "codigo": 7,
  "titulo": "Problema no acesso ao sistema",
  "descricao": "Não consigo acessar o sistema de folha...",
  "codStatus": 1,
  "codPrioridade": 2,
  "codCategoria": 4,
  "codUser": 3,
  "codUserResponsavel": null,
  "dataCriacao": "2026-03-23T10:15:00Z",
  "dataConclusao": null,
  "horasEstimadas": null
}
```

**Response 400** (validação):
```json
{
  "errors": {
    "titulo": "O título é obrigatório e deve ter pelo menos 5 caracteres.",
    "descricao": "A descrição é obrigatória e deve ter pelo menos 10 caracteres."
  }
}
```

---

#### `PATCH /api/tickets/{id}`
Atualizar um chamado existente.

**Permissões:**
- **User**: Não pode atualizar (ou só campos limitados como descrição)
- **Técnico/Admin**: Pode atualizar status, prioridade, responsável, horas estimadas

**Request (Técnico):**
```json
{
  "codStatus": 2,
  "codPrioridade": 3,
  "codUserResponsavel": 5,
  "horasEstimadas": 6.5
}
```

**Response 200:**
```json
{
  "codigo": 1,
  "titulo": "Computador não liga",
  "codStatus": 2,
  "codPrioridade": 3,
  "codUserResponsavel": 5,
  "horasEstimadas": 6.5,
  "dataConclusao": null
}
```

**Response 403:**
```json
{
  "error": "Você não tem permissão para editar este chamado."
}
```

---

#### `DELETE /api/tickets/{id}`
Excluir um chamado (soft delete recomendado).

**Permissões:** Admin apenas

**Response 204:** No Content

---

### 3️⃣ **COMENTÁRIOS**

#### `GET /api/tickets/{ticketId}/comentarios`
Listar comentários de um chamado.

**Comportamento:**
- **User**: Retorna apenas comentários públicos (`interno = false`)
- **Técnico/Admin**: Retorna todos os comentários (incluindo notas internas)

**Response 200:**
```json
{
  "data": [
    {
      "codigo": 1,
      "codigoChamado": 1,
      "codUser": 2,
      "comentario": "Vou verificar o problema...",
      "data": "2026-03-19T10:00:00Z",
      "interno": false,
      "usuario": {
        "codigo": 2,
        "nome": "Maria Santos",
        "email": "maria@empresa.com",
        "role": "Técnico"
      }
    },
    {
      "codigo": 3,
      "codigoChamado": 1,
      "codUser": 2,
      "comentario": "Verifiquei que é problema na fonte.",
      "data": "2026-03-19T14:20:00Z",
      "interno": true,
      "usuario": {
        "codigo": 2,
        "nome": "Maria Santos",
        "email": "maria@empresa.com",
        "role": "Técnico"
      }
    }
  ]
}
```

---

#### `POST /api/tickets/{ticketId}/comentarios`
Adicionar um comentário a um chamado.

**Permissões:**
- **User**: Pode comentar apenas em chamados próprios (`interno` sempre `false`)
- **Técnico/Admin**: Pode comentar em qualquer chamado e marcar como interno

**Request (Técnico):**
```json
{
  "comentario": "Problema resolvido. Troquei a fonte de alimentação.",
  "interno": false
}
```

**Request (User):**
```json
{
  "comentario": "Obrigado! Está funcionando agora."
}
```

**Response 201:**
```json
{
  "codigo": 8,
  "codigoChamado": 1,
  "codUser": 2,
  "comentario": "Problema resolvido...",
  "data": "2026-03-23T15:45:00Z",
  "interno": false
}
```

---

### 4️⃣ **DASHBOARD & MÉTRICAS**

#### `GET /api/dashboard/stats`
Obter estatísticas consolidadas.

**Comportamento por Role:**
- **User**: Estatísticas apenas dos seus chamados
- **Técnico/Admin**: Estatísticas gerais do sistema

**Response 200 (User):**
```json
{
  "totalChamados": 4,
  "emAberto": 2,
  "resolvidos": 2,
  "meusUltimosChamados": [
    {
      "codigo": 1,
      "titulo": "Computador não liga",
      "codStatus": 2,
      "dataConclusao": null
    }
  ]
}
```

**Response 200 (Técnico/Admin):**
```json
{
  "totalChamados": 45,
  "emAberto": 12,
  "emAtendimento": 8,
  "resolvidos": 20,
  "fechados": 5,
  "criticos": 2,
  "chamadosPorStatus": [
    { "codStatus": 1, "descricao": "Aberto", "quantidade": 12 },
    { "codStatus": 2, "descricao": "Em Atendimento", "quantidade": 8 },
    { "codStatus": 4, "descricao": "Resolvido", "quantidade": 20 },
    { "codStatus": 5, "descricao": "Fechado", "quantidade": 5 }
  ],
  "chamadosPorPrioridade": [
    { "codPrioridade": 1, "descricao": "Baixa", "quantidade": 15 },
    { "codPrioridade": 2, "descricao": "Média", "quantidade": 18 },
    { "codPrioridade": 3, "descricao": "Alta", "quantidade": 10 },
    { "codPrioridade": 4, "descricao": "Crítica", "quantidade": 2 }
  ],
  "performanceTecnicos": [
    {
      "codigo": 2,
      "nome": "Maria Santos",
      "ativos": 5,
      "resolvidos": 12,
      "total": 17
    },
    {
      "codigo": 5,
      "nome": "Carlos Mendes",
      "ativos": 3,
      "resolvidos": 8,
      "total": 11
    }
  ],
  "chamadosUrgentes": [
    {
      "codigo": 5,
      "titulo": "Servidor de email fora do ar",
      "codPrioridade": 4,
      "codStatus": 2,
      "codUserResponsavel": 5
    }
  ]
}
```

---

### 5️⃣ **DADOS DE APOIO (LOOKUPS)**

Estes endpoints fornecem dados estáticos/semi-estáticos usados nos filtros e formulários.

#### `GET /api/lookups/statuses`
Listar todos os status disponíveis.

**Response 200:**
```json
{
  "data": [
    { "codigo": 1, "descricao": "Aberto" },
    { "codigo": 2, "descricao": "Em Atendimento" },
    { "codigo": 3, "descricao": "Aguardando Usuário" },
    { "codigo": 4, "descricao": "Resolvido" },
    { "codigo": 5, "descricao": "Fechado" }
  ]
}
```

---

#### `GET /api/lookups/prioridades`
Listar todas as prioridades disponíveis.

**Response 200:**
```json
{
  "data": [
    { "codigo": 1, "descricao": "Baixa" },
    { "codigo": 2, "descricao": "Média" },
    { "codigo": 3, "descricao": "Alta" },
    { "codigo": 4, "descricao": "Crítica" }
  ]
}
```

---

#### `GET /api/lookups/categorias`
Listar todas as categorias disponíveis.

**Response 200:**
```json
{
  "data": [
    { "codigo": 1, "descricao": "Hardware" },
    { "codigo": 2, "descricao": "Software" },
    { "codigo": 3, "descricao": "Rede" },
    { "codigo": 4, "descricao": "Acesso" },
    { "codigo": 5, "descricao": "Sistemas" }
  ]
}
```

---

#### `GET /api/lookups/tecnicos`
Listar todos os técnicos disponíveis (para atribuição).

**Permissões:** Técnico/Admin apenas

**Response 200:**
```json
{
  "data": [
    {
      "codigo": 2,
      "nome": "Maria Santos",
      "email": "maria@empresa.com",
      "ativo": true
    },
    {
      "codigo": 5,
      "nome": "Carlos Mendes",
      "email": "carlos@empresa.com",
      "ativo": true
    }
  ]
}
```

---

### 6️⃣ **USUÁRIOS**

#### `GET /api/users/me`
Obter dados do usuário autenticado.

**Response 200:**
```json
{
  "codigo": 3,
  "nome": "Pedro Costa",
  "email": "pedro@empresa.com",
  "departamentoId": 2,
  "departamento": "RH",
  "role": "Usuário",
  "ativo": true
}
```

---

#### `GET /api/users`
Listar todos os usuários (Admin apenas).

**Permissões:** Admin

**Query Parameters:**
- `page` (int)
- `pageSize` (int)
- `search` (string)
- `role` (string) - Filtrar por role

**Response 200:**
```json
{
  "data": [
    {
      "codigo": 1,
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "departamentoId": 1,
      "departamento": "TI",
      "role": "Admin",
      "ativo": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

---

## 📊 Resumo dos Endpoints

| Método | Endpoint | Descrição | Permissões |
|--------|----------|-----------|------------|
| POST | `/api/auth/login` | Login de usuário | Público |
| POST | `/api/auth/refresh` | Renovar token | Autenticado |
| GET | `/api/tickets` | Listar chamados (com filtros) | User (seus), Técnico/Admin (todos) |
| GET | `/api/tickets/{id}` | Detalhes do chamado | User (seus), Técnico/Admin (todos) |
| POST | `/api/tickets` | Criar chamado | Todos |
| PATCH | `/api/tickets/{id}` | Atualizar chamado | Técnico/Admin |
| DELETE | `/api/tickets/{id}` | Excluir chamado | Admin |
| GET | `/api/tickets/{id}/comentarios` | Listar comentários | User (públicos), Técnico/Admin (todos) |
| POST | `/api/tickets/{id}/comentarios` | Adicionar comentário | User (seus chamados), Técnico/Admin (todos) |
| GET | `/api/dashboard/stats` | Estatísticas | User (suas), Técnico/Admin (todas) |
| GET | `/api/lookups/statuses` | Listar status | Todos |
| GET | `/api/lookups/prioridades` | Listar prioridades | Todos |
| GET | `/api/lookups/categorias` | Listar categorias | Todos |
| GET | `/api/lookups/tecnicos` | Listar técnicos | Técnico/Admin |
| GET | `/api/users/me` | Dados do usuário atual | Todos |
| GET | `/api/users` | Listar usuários | Admin |

---

## 🔄 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 204 | No Content - Operação bem-sucedida sem corpo de resposta |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## 💡 Observações Importantes

### 1. **Autorização baseada em Roles**
O backend deve verificar o role do usuário autenticado:
- **User**: Acesso limitado aos seus próprios chamados
- **Técnico**: Acesso total a chamados + recursos de gestão
- **Admin**: Acesso total + gestão de usuários

### 2. **Filtro Automático por Role**
No endpoint `GET /api/tickets`, o backend deve aplicar automaticamente:
```csharp
if (user.Role == "Usuário") {
    query = query.Where(t => t.CodUser == user.Codigo);
}
```

### 3. **Comentários Internos**
- Técnicos podem adicionar notas internas (`interno: true`)
- Usuários nunca veem comentários internos
- Útil para comunicação entre técnicos

### 4. **Validações Essenciais**
```json
{
  "titulo": "Mínimo 5 caracteres",
  "descricao": "Mínimo 10 caracteres",
  "categoriaId": "Obrigatório",
  "prioridadeId": "Obrigatório"
}
```

### 5. **Endpoints Consolidados**
Note que **não há duplicação**. Um único endpoint `/api/tickets` serve tanto clientes quanto técnicos, diferenciando apenas pela role do usuário autenticado.

---

## 🎯 Próximos Passos

1. ✅ Implementar autenticação JWT
2. ✅ Criar controllers seguindo esta especificação
3. ✅ Aplicar autorização baseada em roles
4. ✅ Implementar paginação
5. ✅ Adicionar validações
6. ✅ Criar testes unitários
7. ✅ Documentar com Swagger/OpenAPI

---

**Autor:** Especificação criada para o sistema Service Desk  
**Versão:** 1.0  
**Data:** Março 2026