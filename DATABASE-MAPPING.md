# 🗄️ Mapeamento do Banco de Dados

## ✅ **Estrutura Atual das Tabelas**

### **TblChamados**
```sql
CREATE TABLE TblChamados (
    Codigo INT PRIMARY KEY IDENTITY(1,1),
    Titulo VARCHAR(200) NOT NULL,
    Descricao TEXT NOT NULL,
    CodStatus INT NOT NULL,
    CodPrioridade INT NOT NULL,
    CodCategoria INT NOT NULL,
    CodUser INT NOT NULL,
    CodUserResponsavel INT NULL,
    DataCriacao DATETIME DEFAULT GETDATE(),
    DataConclusao DATETIME NULL,
    HorasEstimadas DECIMAL(5,2) NULL
);
```

### **TblChamadoStatus**
```sql
CREATE TABLE TblChamadoStatus (
    Codigo INT PRIMARY KEY IDENTITY(1,1),
    Descricao VARCHAR(50) NOT NULL
);
```

### **TblPrioridadeChamado**
```sql
CREATE TABLE TblPrioridadeChamado (
    Codigo INT PRIMARY KEY IDENTITY(1,1),
    Descricao VARCHAR(50) NOT NULL
);
```

### **TblCategoriaChamado**
```sql
CREATE TABLE TblCategoriaChamado (
    Codigo INT PRIMARY KEY,
    Descricao VARCHAR(50) NOT NULL
);
```

### **TblComentariosChamdo**  *(Nota: nome com typo no banco)*
```sql
CREATE TABLE TblComentariosChamdo (
    Codigo INT PRIMARY KEY IDENTITY(1,1),
    CodigoChamado INT NOT NULL,
    CodUser INT NOT NULL,
    Comentario TEXT NOT NULL,
    Data DATETIME DEFAULT GETDATE(),
    Interno BIT DEFAULT 0
);
```

---

## 📋 **Mapeamento de Campos**

| Campo Antigo (Docs) | Campo Novo (Banco Real) | Tipo | Observação |
|---------------------|-------------------------|------|------------|
| `id` | `Codigo` | INT | Chave primária |
| `nome` | `Descricao` | VARCHAR(50) | Em Status, Prioridade, Categoria |
| `statusId` | `CodStatus` | INT | FK para TblChamadoStatus |
| `prioridadeId` | `CodPrioridade` | INT | FK para TblPrioridadeChamado |
| `categoriaId` | `CodCategoria` | INT | FK para TblCategoriaChamado |
| `criadoPorId` | `CodUser` | INT | Usuário que criou |
| `responsavelId` | `CodUserResponsavel` | INT | Técnico responsável |
| `dataAtualizacao` | `DataConclusao` | DATETIME | Data de conclusão |
| `slaId` | ❌ **REMOVIDO** | - | Campo não existe mais |
| `ticketId` | `CodigoChamado` | INT | Em comentários |
| `userId` | `CodUser` | INT | Em comentários |

---

## 🔄 **Alterações Realizadas**

### ✅ **1. Documentação da API**
- **Arquivo:** `/API-SPECIFICATION.md`
  - ✅ Todos os JSONs de exemplo atualizados
  - ✅ Campos renomeados (id → codigo, nome → descricao, etc.)
  - ✅ Campo `horasEstimadas` adicionado
  - ✅ Campo `slaId` removido
  - ✅ `dataAtualizacao` → `dataConclusao`

### ✅ **2. Guia de Integração**
- **Arquivo:** `/INTEGRATION-GUIDE.md`
  - ✅ Estrutura do banco documentada no topo
  - ✅ Exemplos de requisições atualizados
  - ✅ Nomes de campos corrigidos em todos os exemplos

### ✅ **3. Mock Data (Frontend)**
- **Arquivo:** `/src/app/data/mockData.ts`
  - ✅ Interfaces TypeScript atualizadas:
    - `id` → `codigo`
    - `nome` → `descricao`
    - `statusId` → `codStatus`
    - `prioridadeId` → `codPrioridade`
    - `categoriaId` → `codCategoria`
    - `criadoPorId` → `codUser`
    - `responsavelId` → `codUserResponsavel`
    - `dataAtualizacao` → `dataConclusao`
    - `ticketId` → `codigoChamado`
    - Campo `horasEstimadas` adicionado (DECIMAL)
    - Campo `slaId` removido
  - ✅ Dados de exemplo atualizados
  - ✅ Funções auxiliares atualizadas

### ✅ **4. Páginas do Cliente**
- **Arquivo:** `/src/app/pages/client/ClientDashboard.tsx`
  - ✅ `t.criadoPorId` → `t.codUser`
  - ✅ `t.statusId` → `t.codStatus`
  - ✅ `s.id` → `s.codigo`, `s.nome` → `s.descricao`
  - ✅ `p.id` → `p.codigo`, `p.nome` → `p.descricao`
  - ✅ `c.id` → `c.codigo`, `c.nome` → `c.descricao`
  - ✅ `ticket.id` → `ticket.codigo`
  - ✅ `ticket.dataAtualizacao` → `ticket.dataConclusao || ticket.dataCriacao`

- **Arquivo:** `/src/app/pages/client/ClientNewTicket.tsx`
  - ✅ `categoriaId` → `codCategoria`
  - ✅ `prioridadeId` → `codPrioridade`
  - ✅ `p.id` → `p.codigo`
  - ✅ `category.id` → `category.codigo`, `category.nome` → `category.descricao`
  - ✅ `priority.id` → `priority.codigo`, `priority.nome` → `priority.descricao`

---

## ⚠️ **Arquivos Ainda Pendentes de Atualização**

### 📄 **Área do Cliente**
1. ✅ `/src/app/pages/client/ClientDashboard.tsx` - **ATUALIZADO**
2. ✅ `/src/app/pages/client/ClientNewTicket.tsx` - **ATUALIZADO**
3. ⏳ `/src/app/pages/client/ClientTicketDetails.tsx` - **PENDENTE**

### 🔧 **Área do Técnico**
4. ⏳ `/src/app/pages/technician/TechnicianDashboard.tsx` - **PENDENTE**
5. ⏳ `/src/app/pages/technician/TechnicianTickets.tsx` - **PENDENTE**
6. ⏳ `/src/app/pages/technician/TechnicianTicketDetails.tsx` - **PENDENTE**

### 🎨 **Outros**
7. ⏳ `/src/app/pages/ProfileSelector.tsx` - **PENDENTE** (se usar campos de User)

---

## 🎯 **Checklist de Substituição**

Use Find & Replace (Ctrl+H) nos arquivos pendentes:

### **Em Tickets/Chamados:**
- `ticket.id` → `ticket.codigo`
- `t.id` → `t.codigo`
- `.statusId` → `.codStatus`
- `.prioridadeId` → `.codPrioridade`
- `.categoriaId` → `.codCategoria`
- `.criadoPorId` → `.codUser`
- `.responsavelId` → `.codUserResponsavel`
- `.dataAtualizacao` → `.dataConclusao`
- Remover referências a `.slaId`

### **Em Status/Prioridades/Categorias:**
- `.id` → `.codigo`
- `.nome` → `.descricao`
- `s.id` → `s.codigo`
- `s.nome` → `s.descricao`
- `p.id` → `p.codigo`
- `p.nome` → `p.descricao`
- `c.id` → `c.codigo`
- `c.nome` → `c.descricao`

### **Em Comentários:**
- `.ticketId` → `.codigoChamado`
- `.userId` → `.codUser`
- `comment.id` → `comment.codigo`

### **Em Usuários:**
- `user.id` → `user.codigo` *(se aplicável na sua tabela de usuários)*

---

## ✨ **Novos Campos Disponíveis**

### **HorasEstimadas**
- **Tipo:** `DECIMAL(5,2)` ou `number | null` no TypeScript
- **Descrição:** Estimativa de horas que o técnico precisa para resolver
- **Uso:** Técnico preenche ao atribuir/atualizar chamado
- **Exemplo:** `4.5` (4 horas e 30 minutos)

### **DataConclusao**
- **Tipo:** `DATETIME` ou `string | null` no TypeScript
- **Descrição:** Data/hora em que o chamado foi concluído
- **Uso:** Preenchido automaticamente quando status = "Resolvido" ou "Fechado"
- **Exemplo:** `"2026-03-19T16:45:00"`

---

## 🚀 **Próximos Passos**

1. ⏳ Atualizar os arquivos pendentes listados acima
2. ⏳ Testar todas as páginas para garantir que não há erros
3. ⏳ Atualizar `/BACKEND-EXAMPLES.md` com nomes de tabelas reais
4. ⏳ Implementar endpoint da API real no backend

---

**Autor:** Sistema Service Desk  
**Data:** Março 2026  
**Versão:** 2.0 - Atualizado conforme estrutura real do banco de dados
