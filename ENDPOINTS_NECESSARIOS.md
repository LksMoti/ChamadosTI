# 📋 Endpoints Necessários para Funcionalidade de Edição

## ✅ Endpoint Existente
### `GET /api/chamados/opcoes`
**Já existe** - Retorna as prioridades, categorias **e status**

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
  "status": [
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
    }
  ]
}
```

---

## 🔧 Endpoints a Criar

### 1. `GET /api/chamados/tecnicos`
**Objetivo:** Retornar todos os técnicos/usuários que podem ser atribuídos a chamados

**Response esperado:**
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
  }
]
```

**Observações:**
- Deve retornar **todos** os técnicos disponíveis para atribuição
- Não precisa filtrar por setor ou permissão (por enquanto)
- Pode incluir técnicos inativos se necessário

**Alternativas de nome aceitáveis:**
- `/api/usuarios/tecnicos`
- `/api/responsaveis`
- `/api/usuarios/atribuiveis`

---

### 2. `PUT /api/chamados/{id}`
**Objetivo:** Atualizar informações de um chamado (status, prioridade, responsável)

**Request Body:**
```json
{
  "codStatus": 2,
  "codPrioridade": 3,
  "codUserResponsavel": 201
}
```

**Campos opcionais:**
- `codUserResponsavel` pode ser `null` para "Não atribuído"

**Response sucesso (200):**
```json
{
  "sucesso": true,
  "mensagem": "Chamado atualizado com sucesso"
}
```

**Response erro (400/403/404):**
```json
{
  "sucesso": false,
  "mensagem": "Descrição do erro"
}
```

**Observações:**
- Deve validar se o status, prioridade e técnico existem
- Deve atualizar automaticamente a `dataConclusao` quando o status for alterado para "Resolvido" (4) ou "Fechado" (5)
- Pode adicionar validações de permissão se necessário

---

## 📌 Resumo

| Endpoint | Método | Status | Usado em |
|----------|--------|--------|----------|
| `/api/chamados/opcoes` | GET | ✅ Existe | Dropdown de Prioridades |
| `/api/chamados/tecnicos` | GET | 🔧 Criar | Dropdown de Responsáveis |
| `/api/chamados/{id}` | PUT | 🔧 Criar | Salvar alterações do chamado |

---

## 🎯 Fluxo de Uso no Frontend

1. Usuário clica em **"Editar Chamado"**
2. Frontend faz 3 chamadas paralelas:
   - `GET /api/chamados/opcoes` → Pega prioridades, status e categorias
   - `GET /api/chamados/tecnicos` → Pega técnicos
3. Popula os 3 dropdowns com as opções
4. Usuário altera valores e clica em **"Salvar Alterações"**
5. Frontend envia `PUT /api/chamados/{id}` com os novos valores
6. Recarrega os dados do chamado e do dashboard

---

**Dúvidas ou ajustes necessários? Me avise!** 🚀