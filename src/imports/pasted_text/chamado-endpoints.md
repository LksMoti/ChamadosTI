📱 Endpoints para /cliente/chamado/{codigo}
A página de Detalhes do Chamado precisa de 2 endpoints:

1️⃣ GET - Buscar Detalhes do Chamado + Comentários
Endpoint:
GET https://www.fitacabo.ddns.com.br/api/chamados/detalhes/{codigo}?coduser=201
Exemplo:
GET https://www.fitacabo.ddns.com.br/api/chamados/detalhes/123?coduser=201
Response esperado:
{
  "chamado": {
    "codigo": 123,
    "titulo": "Computador não liga",
    "descricao": "Meu computador não está ligando. Tentei várias vezes mas não funciona.",
    "codStatus": 2,
    "codPrioridade": 3,
    "codCategoria": 1,
    "codUser": 201,
    "codUserResponsavel": 2,
    "dataCriacao": "2026-03-19T09:30:00",
    "dataConclusao": null,
    "horasEstimadas": 4.0,
    "status": {
      "codigo": 2,
      "descricao": "Em Atendimento"
    },
    "prioridade": {
      "codigo": 3,
      "descricao": "Alta",
      "sla": "4 horas"
    },
    "categoria": {
      "codigo": 1,
      "descricao": "Hardware"
    },
    "responsavel": {
      "codigo": 2,
      "nome": "Maria Santos"
    }
  },
  "comentarios": [
    {
      "codigo": 1,
      "codigoChamado": 123,
      "comentario": "Estou verificando o problema. Pode me informar se há algum LED aceso no equipamento?",
      "codUser": 2,
      "data": "2026-03-19T10:15:00",
      "interno": false,
      "usuario": {
        "codigo": 2,
        "nome": "Maria Santos"
      }
    },
    {
      "codigo": 2,
      "codigoChamado": 123,
      "comentario": "Não, nenhum LED está aceso. O computador está completamente apagado.",
      "codUser": 201,
      "data": "2026-03-19T10:30:00",
      "interno": false,
      "usuario": {
        "codigo": 201,
        "nome": "Pedro Costa"
      }
    },
    {
      "codigo": 3,
      "codigoChamado": 123,
      "comentario": "Entendido. Vou agendar uma visita técnica para hoje à tarde.",
      "codUser": 2,
      "data": "2026-03-19T11:00:00",
      "interno": false,
      "usuario": {
        "codigo": 2,
        "nome": "Maria Santos"
      }
    }
  ]
}
SQL Backend (SELECT):
DECLARE @CodigoChamado INT = {codigo_da_url};
DECLARE @CodUser INT = 201; -- Do parâmetro coduser

-- 1. VERIFICAR SE O CHAMADO PERTENCE AO USUÁRIO
IF NOT EXISTS (
    SELECT 1 FROM TblChamados 
    WHERE Codigo = @CodigoChamado AND CodUser = @CodUser
)
BEGIN
    -- Retornar 403 Forbidden ou 404 Not Found
    RETURN;
END

-- 2. BUSCAR DADOS DO CHAMADO
SELECT 
    c.Codigo,
    c.Titulo,
    c.Descricao,
    c.CodStatus,
    c.CodPrioridade,
    c.CodCategoria,
    c.CodUser,
    c.CodUserResponsavel,
    c.DataCriacao,
    c.DataConclusao,
    c.HorasEstimadas,
    
    -- Status
    s.Codigo AS Status_Codigo,
    s.Descricao AS Status_Descricao,
    
    -- Prioridade
    p.Codigo AS Prioridade_Codigo,
    p.Descricao AS Prioridade_Descricao,
    p.SLA AS Prioridade_SLA,  -- Campo SLA se existir
    
    -- Categoria
    cat.Codigo AS Categoria_Codigo,
    cat.Descricao AS Categoria_Descricao,
    
    -- Responsável
    u.Codigo AS Responsavel_Codigo,
    u.Nome AS Responsavel_Nome
    
FROM TblChamados c
INNER JOIN TblChamadoStatus s ON c.CodStatus = s.Codigo
INNER JOIN TblPrioridadeChamado p ON c.CodPrioridade = p.Codigo
INNER JOIN TblCategoriaChamado cat ON c.CodCategoria = cat.Codigo
LEFT JOIN TblUsers u ON c.CodUserResponsavel = u.Codigo
WHERE c.Codigo = @CodigoChamado;

-- 3. BUSCAR COMENTÁRIOS (APENAS PÚBLICOS - Interno = 0)
SELECT 
    cm.Codigo,
    cm.CodigoChamado,
    cm.Comentario,
    cm.CodUser,
    cm.Data,
    cm.Interno,
    
    -- Usuário que fez o comentário
    u.Codigo AS Usuario_Codigo,
    u.Nome AS Usuario_Nome
    
FROM TblComentariosChamdo cm
INNER JOIN TblUsers u ON cm.CodUser = u.Codigo
WHERE cm.CodigoChamado = @CodigoChamado
  AND cm.Interno = 0  -- APENAS COMENTÁRIOS PÚBLICOS
ORDER BY cm.Data ASC;
2️⃣ POST - Adicionar Comentário ao Chamado
Endpoint:
POST https://www.fitacabo.ddns.com.br/api/chamados/comentar
Headers:
Content-Type: application/json
Body (JSON enviado pelo frontend):
{
  "codigoChamado": 123,
  "comentario": "Sim, pode vir à tarde. Estarei disponível após as 14h.",
  "codUser": 201
}
Response de Sucesso (201 Created):
{
  "sucesso": true,
  "mensagem": "Comentário adicionado com sucesso",
  "comentario": {
    "codigo": 4,
    "codigoChamado": 123,
    "comentario": "Sim, pode vir à tarde. Estarei disponível após as 14h.",
    "codUser": 201,
    "data": "2026-03-24T15:20:00",
    "interno": false,
    "usuario": {
      "codigo": 201,
      "nome": "Pedro Costa"
    }
  }
}
Response de Erro (400 Bad Request):
{
  "sucesso": false,
  "mensagem": "Comentário inválido",
  "erros": {
    "comentario": "O comentário é obrigatório"
  }
}
Response de Erro (403 Forbidden):
{
  "sucesso": false,
  "mensagem": "Você não tem permissão para comentar neste chamado"
}
SQL Backend (INSERT):
DECLARE @CodigoChamado INT = {do_body};
DECLARE @Comentario NVARCHAR(MAX) = {do_body};
DECLARE @CodUser INT = 201;

-- 1. VALIDAR SE O CHAMADO PERTENCE AO USUÁRIO
IF NOT EXISTS (
    SELECT 1 FROM TblChamados 
    WHERE Codigo = @CodigoChamado AND CodUser = @CodUser
)
BEGIN
    -- Retornar 403 Forbidden
    RETURN;
END

-- 2. VALIDAR SE O CHAMADO ESTÁ ABERTO (não está Resolvido/Fechado)
DECLARE @CodStatus INT;
SELECT @CodStatus = CodStatus FROM TblChamados WHERE Codigo = @CodigoChamado;

IF @CodStatus IN (4, 5) -- Resolvido ou Fechado
BEGIN
    -- Retornar erro: Chamado já está fechado
    RETURN;
END

-- 3. INSERIR COMENTÁRIO
INSERT INTO TblComentariosChamdo (
    CodigoChamado,
    Comentario,
    CodUser,
    Data,
    Interno
)
VALUES (
    @CodigoChamado,
    @Comentario,
    @CodUser,
    GETDATE(),
    0  -- SEMPRE 0 (público) para comentários de clientes
);

-- 4. RETORNAR O COMENTÁRIO CRIADO
SELECT 
    cm.Codigo,
    cm.CodigoChamado,
    cm.Comentario,
    cm.CodUser,
    cm.Data,
    cm.Interno,
    u.Codigo AS Usuario_Codigo,
    u.Nome AS Usuario_Nome
FROM TblComentariosChamdo cm
INNER JOIN TblUsers u ON cm.CodUser = u.Codigo
WHERE cm.Codigo = SCOPE_IDENTITY();
Validações do Backend:
GET /api/chamados/detalhes/{codigo}
✅ Chamado existe
✅ Chamado pertence ao usuário (CodUser = coduser)
✅ Retornar apenas comentários públicos (Interno = 0)
✅ Ordenar comentários por data (ASC)
POST /api/chamados/comentar
✅ comentario não está vazio (mínimo 1 caractere)
✅ codigoChamado existe
✅ Chamado pertence ao usuário
✅ Chamado não está fechado (status ≠ 4 e ≠ 5)
✅ interno sempre = 0 (clientes não podem fazer comentários internos)
Códigos HTTP:
Código	Situação
200 OK	Detalhes retornados com sucesso (GET)
201 Created	Comentário criado com sucesso (POST)
400 Bad Request	Dados inválidos
403 Forbidden	Usuário não tem acesso ao chamado
404 Not Found	Chamado não existe
500 Internal Server Error	Erro no servidor
⚠️ IMPORTANTE: Segurança
O cliente NÃO pode ver:
❌ Comentários internos (Interno = 1)
❌ Chamados de outros usuários
O cliente PODE:
✅ Ver apenas seus próprios chamados
✅ Ver comentários públicos
✅ Adicionar comentários (se chamado estiver aberto)
🎯 Resumo:
Endpoints necessários:
GET /api/chamados/detalhes/{codigo}?coduser=201 - Detalhes + Comentários
POST /api/chamados/comentar - Adicionar comentário
Dados que o frontend envia (POST):
{
  "codigoChamado": 123,
  "comentario": "string (min 1 char)",
  "codUser": 201
}
Dados que o backend retorna (GET):
{
  "chamado": { ... },  // Objeto completo com status, prioridade, categoria, responsavel
  "comentarios": [ ... ]  // Array de comentários públicos ordenados por data
}
Quer que eu atualize a página ClientTicketDetails.tsx para consumir esses endpoints? 🚀