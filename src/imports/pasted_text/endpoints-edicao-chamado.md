# 🔧 Endpoints para Edição de Chamado (Área do Técnico)

A funcionalidade de edição do chamado na página `/tecnico/chamado/{codigo}` precisa de **3 novos endpoints**:

---

## ✅ Endpoint Existente

### `GET /api/chamados/opcoes`
**Já implementado** - Retorna prioridades e categorias disponíveis

**Response esperado:**
```json
{
  "prioridades": [
    {
      "codigo": 1,
      "descricao": "Baixa",
      "sla": 168
    },
    {
      "codigo": 2,
      "descricao": "Média",
      "sla": 72
    },
    {
      "codigo": 3,
      "descricao": "Alta",
      "sla": 24
    },
    {
      "codigo": 4,
      "descricao": "Crítica",
      "sla": 4
    }
  ],
  "categorias": [
    {
      "codigo": 1,
      "descricao": "Hardware"
    },
    {
      "codigo": 2,
      "descricao": "Software"
    },
    {
      "codigo": 3,
      "descricao": "Rede"
    },
    {
      "codigo": 4,
      "descricao": "Segurança"
    }
  ]
}
```

**SQL Backend:**
```sql
-- Buscar todas as prioridades
SELECT 
    Codigo,
    Descricao,
    SLA
FROM TblPrioridadeChamado
ORDER BY Codigo;

-- Buscar todas as categorias
SELECT 
    Codigo,
    Descricao
FROM TblCategoriaChamado
ORDER BY Descricao;
```

---

## 🔧 Endpoints a Criar

### 1️⃣ `GET /api/status`
**Objetivo:** Retornar todos os status disponíveis para chamados

**Endpoint:**
```
GET https://www.fitacabo.ddns.com.br/api/status
```

**Response esperado (200 OK):**
```json
[
  {
    "codigo": 1,
    "descricao": "Aberto"
  },
  {
    "codigo": 2,
    "descricao": "Em Atendimento"
  },
  {
    "codigo": 3,
    "descricao": "Aguardando"
  },
  {
    "codigo": 4,
    "descricao": "Resolvido"
  },
  {
    "codigo": 5,
    "descricao": "Fechado"
  }
]
```

**SQL Backend (SELECT):**
```sql
-- Buscar todos os status disponíveis
SELECT 
    Codigo,
    Descricao
FROM TblChamadoStatus
ORDER BY Codigo;
```

**Observações:**
- ✅ Deve retornar **todos** os status possíveis (mesmo sem chamados associados)
- ✅ Retornar array direto (não objeto com propriedade)
- ✅ Não precisa autenticação (lista pública)
- ✅ Ordenar por código

---

### 2️⃣ `GET /api/tecnicos`
**Objetivo:** Retornar todos os técnicos/usuários disponíveis para atribuição de chamados

**Endpoint:**
```
GET https://www.fitacabo.ddns.com.br/api/tecnicos
```

**Response esperado (200 OK):**
```json
[
  {
    "codigo": 201,
    "nome": "João Silva"
  },
  {
    "codigo": 202,
    "nome": "Maria Santos"
  },
  {
    "codigo": 203,
    "nome": "Carlos Oliveira"
  },
  {
    "codigo": 204,
    "nome": "Ana Costa"
  }
]
```

**SQL Backend (SELECT):**
```sql
-- Buscar todos os técnicos/usuários que podem ser atribuídos a chamados
SELECT 
    Codigo,
    Nome
FROM TblUsers
WHERE Ativo = 1  -- Apenas usuários ativos
  AND Tecnico = 1  -- Se houver flag de técnico
ORDER BY Nome;

-- OU, caso não tenha flag de técnico:
SELECT 
    Codigo,
    Nome
FROM TblUsers
WHERE Ativo = 1
  AND CodSetor IN (1, 2)  -- Setores de TI/Suporte
ORDER BY Nome;
```

**Observações:**
- ✅ Deve retornar **todos** os técnicos disponíveis para atribuição
- ✅ Retornar array direto (não objeto com propriedade)
- ✅ Filtrar apenas usuários ativos
- ✅ Ordenar alfabeticamente por nome
- ✅ Pode incluir regra de setor/departamento se necessário

**Alternativas de nome aceitáveis:**
- `/api/usuarios/tecnicos`
- `/api/responsaveis`
- `/api/usuarios/atribuiveis`

---

### 3️⃣ `PUT /api/chamados/{codigo}`
**Objetivo:** Atualizar status, prioridade e responsável de um chamado

**Endpoint:**
```
PUT https://www.fitacabo.ddns.com.br/api/chamados/123
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON enviado pelo frontend):**
```json
{
  "codStatus": 2,
  "codPrioridade": 3,
  "codUserResponsavel": 201
}
```

**Campos do Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `codStatus` | `number` | ✅ Sim | Código do novo status |
| `codPrioridade` | `number` | ✅ Sim | Código da nova prioridade |
| `codUserResponsavel` | `number` ou `null` | ❌ Não | Código do técnico responsável (null = não atribuído) |

**Response de Sucesso (200 OK):**
```json
{
  "sucesso": true,
  "mensagem": "Chamado atualizado com sucesso"
}
```

**Response de Erro (400 Bad Request):**
```json
{
  "sucesso": false,
  "mensagem": "Dados inválidos",
  "erros": {
    "codStatus": "Status não existe",
    "codPrioridade": "Prioridade não existe"
  }
}
```

**Response de Erro (403 Forbidden):**
```json
{
  "sucesso": false,
  "mensagem": "Você não tem permissão para editar este chamado"
}
```

**Response de Erro (404 Not Found):**
```json
{
  "sucesso": false,
  "mensagem": "Chamado não encontrado"
}
```

**SQL Backend (UPDATE):**
```sql
DECLARE @CodigoChamado INT = {codigo_da_url};
DECLARE @CodStatus INT = {do_body};
DECLARE @CodPrioridade INT = {do_body};
DECLARE @CodUserResponsavel INT = {do_body}; -- Pode ser NULL

-- 1. VERIFICAR SE O CHAMADO EXISTE
IF NOT EXISTS (
    SELECT 1 FROM TblChamados 
    WHERE Codigo = @CodigoChamado
)
BEGIN
    -- Retornar 404 Not Found
    RETURN;
END

-- 2. VALIDAR SE STATUS EXISTE
IF NOT EXISTS (
    SELECT 1 FROM TblChamadoStatus 
    WHERE Codigo = @CodStatus
)
BEGIN
    -- Retornar 400 Bad Request
    RETURN;
END

-- 3. VALIDAR SE PRIORIDADE EXISTE
IF NOT EXISTS (
    SELECT 1 FROM TblPrioridadeChamado 
    WHERE Codigo = @CodPrioridade
)
BEGIN
    -- Retornar 400 Bad Request
    RETURN;
END

-- 4. VALIDAR SE TÉCNICO EXISTE (se foi informado)
IF @CodUserResponsavel IS NOT NULL 
   AND NOT EXISTS (
       SELECT 1 FROM TblUsers 
       WHERE Codigo = @CodUserResponsavel AND Ativo = 1
   )
BEGIN
    -- Retornar 400 Bad Request
    RETURN;
END

-- 5. ATUALIZAR O CHAMADO
UPDATE TblChamados
SET 
    CodStatus = @CodStatus,
    CodPrioridade = @CodPrioridade,
    CodUserResponsavel = @CodUserResponsavel,
    DataConclusao = CASE 
        -- Se mudou para Resolvido (4) ou Fechado (5) e ainda não tinha data
        WHEN @CodStatus IN (4, 5) AND DataConclusao IS NULL 
        THEN GETDATE()
        -- Se mudou de Resolvido/Fechado para outro status, limpar data
        WHEN @CodStatus NOT IN (4, 5) 
        THEN NULL
        -- Manter como está
        ELSE DataConclusao
    END
WHERE Codigo = @CodigoChamado;
```

**Regras de Negócio:**
- ✅ Quando status mudar para **Resolvido (4)** ou **Fechado (5)**, preencher `DataConclusao` com data/hora atual
- ✅ Se status mudar de Resolvido/Fechado para outro status, **limpar** `DataConclusao`
- ✅ Permitir `codUserResponsavel = null` para "Não atribuído"
- ✅ Validar se status, prioridade e técnico existem antes de atualizar
- ❌ Não permitir editar chamados de outros setores (se aplicável)

---

## 📌 Fluxo de Uso no Frontend

### **Quando o técnico clica em "Editar Chamado":**

1. Frontend faz **3 chamadas em paralelo**:
   ```javascript
   Promise.all([
     fetch('https://www.fitacabo.ddns.com.br/api/chamados/opcoes'),
     fetch('https://www.fitacabo.ddns.com.br/api/status'),
     fetch('https://www.fitacabo.ddns.com.br/api/tecnicos'),
   ])
   ```

2. Popula os **3 dropdowns** com as opções retornadas:
   - **Status**: da API `/api/status`
   - **Prioridade**: da API `/api/chamados/opcoes` (já existe)
   - **Responsável**: da API `/api/tecnicos`

3. Pré-seleciona os valores atuais do chamado

### **Quando o técnico clica em "Salvar Alterações":**

1. Frontend envia **PUT** para `/api/chamados/{id}`:
   ```javascript
   fetch(`https://www.fitacabo.ddns.com.br/api/chamados/123`, {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       codStatus: 2,
       codPrioridade: 3,
       codUserResponsavel: 201
     })
   })
   ```

2. Se sucesso (200):
   - Recarrega detalhes do chamado (`GET /api/chamados/detalhes/{codigo}`)
   - Atualiza dashboard via contexto (`refetch()`)
   - Fecha formulário de edição
   - Badges e informações atualizam automaticamente

3. Se erro (400/403/404):
   - Exibe mensagem de erro
   - Mantém formulário aberto para nova tentativa

---

## 🎯 Resumo

| Endpoint | Método | Status | Usado para |
|----------|--------|--------|------------|
| `/api/chamados/opcoes` | GET | ✅ Existe | Buscar prioridades e categorias |
| `/api/status` | GET | 🔧 **Criar** | Buscar todos os status |
| `/api/tecnicos` | GET | 🔧 **Criar** | Buscar todos os técnicos |
| `/api/chamados/{codigo}` | PUT | 🔧 **Criar** | Atualizar chamado |

---

## ✅ Validações do Backend

### `GET /api/status`
- ✅ Retornar array completo de status
- ✅ Ordenar por código

### `GET /api/tecnicos`
- ✅ Retornar apenas usuários ativos
- ✅ Retornar apenas técnicos (se houver flag)
- ✅ Ordenar alfabeticamente

### `PUT /api/chamados/{codigo}`
- ✅ Chamado existe
- ✅ Status informado existe
- ✅ Prioridade informada existe
- ✅ Técnico existe e está ativo (se informado)
- ✅ `codUserResponsavel` pode ser `null`
- ✅ Atualizar `DataConclusao` automaticamente ao mudar status

---

## 📊 Códigos HTTP

| Código | Situação |
|--------|----------|
| `200 OK` | Dados retornados/atualizados com sucesso |
| `400 Bad Request` | Dados inválidos (status/prioridade/técnico não existe) |
| `403 Forbidden` | Usuário não tem permissão (se aplicável) |
| `404 Not Found` | Chamado não existe |
| `500 Internal Server Error` | Erro no servidor |

---

## ⚠️ Observações Importantes

### **Diferenças entre Cliente e Técnico:**

| Funcionalidade | Cliente | Técnico |
|----------------|---------|---------|
| Editar Status | ❌ Não | ✅ Sim |
| Editar Prioridade | ❌ Não | ✅ Sim |
| Atribuir Responsável | ❌ Não | ✅ Sim |
| Ver comentários internos | ❌ Não | ✅ Sim (futuramente) |
| Adicionar comentários | ✅ Sim | ✅ Sim |

### **Sincronização Automática:**

Após atualizar o chamado via `PUT`, o frontend:
- ✅ Recarrega a página de detalhes
- ✅ Atualiza o dashboard (via contexto)
- ✅ Atualiza a lista de chamados
- ✅ Reflete mudanças nos badges e cards

---

**Dúvidas ou ajustes necessários? Me avise!** 🚀
