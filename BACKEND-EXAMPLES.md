# 💻 Exemplos de Código Backend (C# .NET)

Este documento fornece **exemplos práticos de implementação** dos principais endpoints da API em C# .NET.

---

## 🏗️ Estrutura do Projeto

```
ServiceDesk.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── TicketsController.cs
│   ├── DashboardController.cs
│   └── LookupsController.cs
├── Services/
│   ├── ITicketService.cs
│   ├── TicketService.cs
│   ├── IAuthService.cs
│   └── AuthService.cs
├── Models/
│   ├── DTOs/
│   │   ├── TicketDto.cs
│   │   ├── CreateTicketDto.cs
│   │   └── UpdateTicketDto.cs
│   └── Entities/
│       ├── Ticket.cs
│       ├── User.cs
│       └── TicketComment.cs
└── Data/
    └── ApplicationDbContext.cs
```

---

## 1️⃣ Controller de Tickets

### `TicketsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ServiceDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;
        
        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        // GET: api/tickets
        [HttpGet]
        public async Task<ActionResult<PagedResponse<TicketDto>>> GetTickets(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] int? status = null,
            [FromQuery] int? prioridade = null,
            [FromQuery] int? categoria = null,
            [FromQuery] string? search = null)
        {
            var userId = GetUserId();
            var userRole = GetUserRole();
            
            var result = await _ticketService.GetTicketsAsync(
                userId, 
                userRole, 
                page, 
                pageSize, 
                status, 
                prioridade, 
                categoria, 
                search
            );
            
            return Ok(result);
        }

        // GET: api/tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDetailDto>> GetTicket(int id)
        {
            var userId = GetUserId();
            var userRole = GetUserRole();
            
            var ticket = await _ticketService.GetTicketByIdAsync(id, userId, userRole);
            
            if (ticket == null)
            {
                return NotFound(new { error = "Chamado não encontrado." });
            }
            
            return Ok(ticket);
        }

        // POST: api/tickets
        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { errors = ModelState });
            }
            
            var userId = GetUserId();
            var ticket = await _ticketService.CreateTicketAsync(dto, userId);
            
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
        }

        // PATCH: api/tickets/5
        [HttpPatch("{id}")]
        [Authorize(Roles = "Técnico,Admin")]
        public async Task<ActionResult<TicketDto>> UpdateTicket(int id, UpdateTicketDto dto)
        {
            var userId = GetUserId();
            
            try
            {
                var ticket = await _ticketService.UpdateTicketAsync(id, dto, userId);
                return Ok(ticket);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Chamado não encontrado." });
            }
        }

        // POST: api/tickets/5/comentarios
        [HttpPost("{id}/comentarios")]
        public async Task<ActionResult<CommentDto>> AddComment(int id, CreateCommentDto dto)
        {
            var userId = GetUserId();
            var userRole = GetUserRole();
            
            try
            {
                var comment = await _ticketService.AddCommentAsync(id, dto, userId, userRole);
                return CreatedAtAction(nameof(GetTicket), new { id }, comment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Chamado não encontrado." });
            }
        }

        // Helper methods
        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "Usuário";
        }
    }
}
```

---

## 2️⃣ Service de Tickets

### `ITicketService.cs`

```csharp
public interface ITicketService
{
    Task<PagedResponse<TicketDto>> GetTicketsAsync(
        int userId, 
        string userRole, 
        int page, 
        int pageSize, 
        int? statusId, 
        int? prioridadeId, 
        int? categoriaId, 
        string? search
    );
    
    Task<TicketDetailDto?> GetTicketByIdAsync(int ticketId, int userId, string userRole);
    Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int userId);
    Task<TicketDto> UpdateTicketAsync(int ticketId, UpdateTicketDto dto, int userId);
    Task<CommentDto> AddCommentAsync(int ticketId, CreateCommentDto dto, int userId, string userRole);
}
```

### `TicketService.cs`

```csharp
using Microsoft.EntityFrameworkCore;

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;
    
    public TicketService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<TicketDto>> GetTicketsAsync(
        int userId, 
        string userRole, 
        int page, 
        int pageSize,
        int? statusId,
        int? prioridadeId,
        int? categoriaId,
        string? search)
    {
        var query = _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Prioridade)
            .Include(t => t.Categoria)
            .Include(t => t.CriadoPor)
            .Include(t => t.Responsavel)
            .AsQueryable();

        // FILTRO AUTOMÁTICO POR ROLE
        if (userRole == "Usuário")
        {
            query = query.Where(t => t.CriadoPorId == userId);
        }

        // Filtros opcionais
        if (statusId.HasValue)
        {
            query = query.Where(t => t.StatusId == statusId.Value);
        }

        if (prioridadeId.HasValue)
        {
            query = query.Where(t => t.PrioridadeId == prioridadeId.Value);
        }

        if (categoriaId.HasValue)
        {
            query = query.Where(t => t.CategoriaId == categoriaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => 
                t.Titulo.Contains(search) || 
                t.Descricao.Contains(search) ||
                t.Id.ToString() == search
            );
        }

        // Total de itens
        var totalItems = await query.CountAsync();

        // Paginação
        var tickets = await query
            .OrderByDescending(t => t.DataCriacao)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Titulo = t.Titulo,
                Descricao = t.Descricao,
                StatusId = t.StatusId,
                PrioridadeId = t.PrioridadeId,
                CategoriaId = t.CategoriaId,
                CriadoPorId = t.CriadoPorId,
                ResponsavelId = t.ResponsavelId,
                DataCriacao = t.DataCriacao,
                DataAtualizacao = t.DataAtualizacao,
                Status = new StatusDto { Id = t.Status.Id, Nome = t.Status.Nome },
                Prioridade = new PrioridadeDto 
                { 
                    Id = t.Prioridade.Id, 
                    Nome = t.Prioridade.Nome, 
                    Sla = t.Prioridade.Sla 
                },
                Categoria = new CategoriaDto { Id = t.Categoria.Id, Nome = t.Categoria.Nome },
                CriadoPor = new UserDto 
                { 
                    Id = t.CriadoPor.Id, 
                    Nome = t.CriadoPor.Nome, 
                    Email = t.CriadoPor.Email 
                },
                Responsavel = t.Responsavel != null ? new UserDto
                {
                    Id = t.Responsavel.Id,
                    Nome = t.Responsavel.Nome,
                    Email = t.Responsavel.Email
                } : null,
                TotalComentarios = t.Comentarios.Count
            })
            .ToListAsync();

        return new PagedResponse<TicketDto>
        {
            Data = tickets,
            Pagination = new PaginationInfo
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            }
        };
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(int ticketId, int userId, string userRole)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Prioridade)
            .Include(t => t.Categoria)
            .Include(t => t.CriadoPor)
                .ThenInclude(u => u.Departamento)
            .Include(t => t.Responsavel)
            .Include(t => t.Comentarios)
                .ThenInclude(c => c.Usuario)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
        {
            return null;
        }

        // AUTORIZAÇÃO: Usuário comum só pode ver seus próprios chamados
        if (userRole == "Usuário" && ticket.CriadoPorId != userId)
        {
            throw new UnauthorizedAccessException("Acesso negado.");
        }

        // Filtrar comentários internos para usuários comuns
        var comentarios = ticket.Comentarios;
        if (userRole == "Usuário")
        {
            comentarios = comentarios.Where(c => !c.Interno).ToList();
        }

        return new TicketDetailDto
        {
            Id = ticket.Id,
            Titulo = ticket.Titulo,
            Descricao = ticket.Descricao,
            StatusId = ticket.StatusId,
            PrioridadeId = ticket.PrioridadeId,
            CategoriaId = ticket.CategoriaId,
            DataCriacao = ticket.DataCriacao,
            DataAtualizacao = ticket.DataAtualizacao,
            Status = new StatusDto { Id = ticket.Status.Id, Nome = ticket.Status.Nome },
            Prioridade = new PrioridadeDto 
            { 
                Id = ticket.Prioridade.Id, 
                Nome = ticket.Prioridade.Nome, 
                Sla = ticket.Prioridade.Sla 
            },
            Categoria = new CategoriaDto { Id = ticket.Categoria.Id, Nome = ticket.Categoria.Nome },
            CriadoPor = new UserDetailDto
            {
                Id = ticket.CriadoPor.Id,
                Nome = ticket.CriadoPor.Nome,
                Email = ticket.CriadoPor.Email,
                Departamento = ticket.CriadoPor.Departamento?.Nome
            },
            Responsavel = ticket.Responsavel != null ? new UserDto
            {
                Id = ticket.Responsavel.Id,
                Nome = ticket.Responsavel.Nome,
                Email = ticket.Responsavel.Email
            } : null,
            Comentarios = comentarios.Select(c => new CommentDto
            {
                Id = c.Id,
                TicketId = c.TicketId,
                UserId = c.UserId,
                Comentario = c.Comentario,
                Data = c.Data,
                Interno = c.Interno,
                Usuario = new UserDto
                {
                    Id = c.Usuario.Id,
                    Nome = c.Usuario.Nome,
                    Role = c.Usuario.Role
                }
            }).ToList()
        };
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int userId)
    {
        var ticket = new Ticket
        {
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            CategoriaId = dto.CategoriaId,
            PrioridadeId = dto.PrioridadeId,
            CriadoPorId = userId,
            StatusId = 1, // Aberto
            DataCriacao = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow,
            SlaId = dto.PrioridadeId // Simplificado
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // TODO: Enviar notificação para técnicos

        return await GetTicketDtoAsync(ticket.Id);
    }

    public async Task<TicketDto> UpdateTicketAsync(int ticketId, UpdateTicketDto dto, int userId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        
        if (ticket == null)
        {
            throw new KeyNotFoundException();
        }

        // Atualizar campos
        if (dto.StatusId.HasValue)
        {
            ticket.StatusId = dto.StatusId.Value;
            
            // Registrar histórico
            await LogHistoryAsync(ticketId, "StatusId", ticket.StatusId.ToString(), 
                dto.StatusId.Value.ToString(), userId);
        }

        if (dto.PrioridadeId.HasValue)
        {
            ticket.PrioridadeId = dto.PrioridadeId.Value;
            await LogHistoryAsync(ticketId, "PrioridadeId", ticket.PrioridadeId.ToString(), 
                dto.PrioridadeId.Value.ToString(), userId);
        }

        if (dto.ResponsavelId.HasValue)
        {
            ticket.ResponsavelId = dto.ResponsavelId.Value;
            await LogHistoryAsync(ticketId, "ResponsavelId", 
                ticket.ResponsavelId?.ToString() ?? "null", 
                dto.ResponsavelId.Value.ToString(), userId);
        }

        ticket.DataAtualizacao = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        // TODO: Enviar notificações

        return await GetTicketDtoAsync(ticket.Id);
    }

    public async Task<CommentDto> AddCommentAsync(
        int ticketId, 
        CreateCommentDto dto, 
        int userId, 
        string userRole)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        
        if (ticket == null)
        {
            throw new KeyNotFoundException();
        }

        // Usuários comuns só podem comentar em seus próprios chamados
        if (userRole == "Usuário" && ticket.CriadoPorId != userId)
        {
            throw new UnauthorizedAccessException();
        }

        // Usuários comuns não podem criar notas internas
        var isInterno = userRole != "Usuário" && dto.Interno;

        var comment = new TicketComment
        {
            TicketId = ticketId,
            UserId = userId,
            Comentario = dto.Comentario,
            Data = DateTime.UtcNow,
            Interno = isInterno
        };

        _context.TicketComments.Add(comment);
        
        // Atualizar data de atualização do ticket
        ticket.DataAtualizacao = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        // TODO: Enviar notificação

        return new CommentDto
        {
            Id = comment.Id,
            TicketId = comment.TicketId,
            UserId = comment.UserId,
            Comentario = comment.Comentario,
            Data = comment.Data,
            Interno = comment.Interno
        };
    }

    private async Task LogHistoryAsync(
        int ticketId, 
        string campo, 
        string valorAnterior, 
        string valorNovo, 
        int userId)
    {
        var history = new TicketHistory
        {
            TicketId = ticketId,
            CampoAlterado = campo,
            ValorAnterior = valorAnterior,
            ValorNovo = valorNovo,
            AlteradoPor = userId,
            DataAlteracao = DateTime.UtcNow
        };

        _context.TicketHistories.Add(history);
    }

    private async Task<TicketDto> GetTicketDtoAsync(int ticketId)
    {
        return await _context.Tickets
            .Where(t => t.Id == ticketId)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Titulo = t.Titulo,
                Descricao = t.Descricao,
                StatusId = t.StatusId,
                PrioridadeId = t.PrioridadeId,
                CategoriaId = t.CategoriaId,
                DataCriacao = t.DataCriacao,
                DataAtualizacao = t.DataAtualizacao
            })
            .FirstAsync();
    }
}
```

---

## 3️⃣ Controller de Dashboard

### `DashboardController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var userId = GetUserId();
        var userRole = GetUserRole();

        if (userRole == "Usuário")
        {
            return Ok(await GetClientStatsAsync(userId));
        }
        else
        {
            return Ok(await GetTechnicianStatsAsync());
        }
    }

    private async Task<ClientDashboardDto> GetClientStatsAsync(int userId)
    {
        var tickets = await _context.Tickets
            .Where(t => t.CriadoPorId == userId)
            .ToListAsync();

        return new ClientDashboardDto
        {
            TotalChamados = tickets.Count,
            EmAberto = tickets.Count(t => t.StatusId == 1 || t.StatusId == 2 || t.StatusId == 3),
            Resolvidos = tickets.Count(t => t.StatusId == 4 || t.StatusId == 5),
            MeusUltimosChamados = await _context.Tickets
                .Where(t => t.CriadoPorId == userId)
                .OrderByDescending(t => t.DataAtualizacao)
                .Take(5)
                .Select(t => new TicketSummaryDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    StatusId = t.StatusId,
                    DataAtualizacao = t.DataAtualizacao
                })
                .ToListAsync()
        };
    }

    private async Task<TechnicianDashboardDto> GetTechnicianStatsAsync()
    {
        var tickets = await _context.Tickets
            .Include(t => t.Responsavel)
            .ToListAsync();

        var stats = new TechnicianDashboardDto
        {
            TotalChamados = tickets.Count,
            EmAberto = tickets.Count(t => t.StatusId == 1 || t.StatusId == 2),
            EmAtendimento = tickets.Count(t => t.StatusId == 2),
            Resolvidos = tickets.Count(t => t.StatusId == 4 || t.StatusId == 5),
            Fechados = tickets.Count(t => t.StatusId == 5),
            Criticos = tickets.Count(t => t.PrioridadeId == 4),
            
            ChamadosPorStatus = await _context.Tickets
                .GroupBy(t => t.StatusId)
                .Select(g => new StatusStatsDto
                {
                    StatusId = g.Key,
                    Nome = g.First().Status.Nome,
                    Quantidade = g.Count()
                })
                .ToListAsync(),
            
            ChamadosPorPrioridade = await _context.Tickets
                .GroupBy(t => t.PrioridadeId)
                .Select(g => new PriorityStatsDto
                {
                    PrioridadeId = g.Key,
                    Nome = g.First().Prioridade.Nome,
                    Quantidade = g.Count()
                })
                .ToListAsync(),
            
            PerformanceTecnicos = await _context.Users
                .Where(u => u.Role == "Técnico")
                .Select(u => new TechnicianPerformanceDto
                {
                    TecnicoId = u.Id,
                    Nome = u.Nome,
                    Ativos = tickets.Count(t => t.ResponsavelId == u.Id && 
                        (t.StatusId == 1 || t.StatusId == 2)),
                    Resolvidos = tickets.Count(t => t.ResponsavelId == u.Id && 
                        (t.StatusId == 4 || t.StatusId == 5)),
                    Total = tickets.Count(t => t.ResponsavelId == u.Id)
                })
                .ToListAsync(),
            
            ChamadosUrgentes = await _context.Tickets
                .Where(t => (t.ResponsavelId == null && t.StatusId == 1) || t.PrioridadeId == 4)
                .OrderByDescending(t => t.PrioridadeId)
                .Take(5)
                .Select(t => new TicketSummaryDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    PrioridadeId = t.PrioridadeId,
                    StatusId = t.StatusId,
                    ResponsavelId = t.ResponsavelId
                })
                .ToListAsync()
        };

        return stats;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    private string GetUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value ?? "Usuário";
    }
}
```

---

## 4️⃣ Controller de Lookups

### `LookupsController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LookupsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public LookupsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("statuses")]
    public async Task<ActionResult> GetStatuses()
    {
        var statuses = await _context.TicketStatuses
            .Select(s => new { s.Id, s.Nome })
            .ToListAsync();
        
        return Ok(new { data = statuses });
    }

    [HttpGet("prioridades")]
    public async Task<ActionResult> GetPriorities()
    {
        var priorities = await _context.TicketPriorities
            .Select(p => new { p.Id, p.Nome, p.Sla })
            .ToListAsync();
        
        return Ok(new { data = priorities });
    }

    [HttpGet("categorias")]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _context.TicketCategories
            .Select(c => new { c.Id, c.Nome })
            .ToListAsync();
        
        return Ok(new { data = categories });
    }

    [HttpGet("tecnicos")]
    [Authorize(Roles = "Técnico,Admin")]
    public async Task<ActionResult> GetTechnicians()
    {
        var technicians = await _context.Users
            .Where(u => u.Role == "Técnico" && u.Ativo)
            .Select(u => new 
            { 
                u.Id, 
                u.Nome, 
                u.Email, 
                u.Ativo 
            })
            .ToListAsync();
        
        return Ok(new { data = technicians });
    }
}
```

---

## 5️⃣ DTOs (Data Transfer Objects)

### `CreateTicketDto.cs`

```csharp
using System.ComponentModel.DataAnnotations;

public class CreateTicketDto
{
    [Required(ErrorMessage = "O título é obrigatório")]
    [MinLength(5, ErrorMessage = "O título deve ter pelo menos 5 caracteres")]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição é obrigatória")]
    [MinLength(10, ErrorMessage = "A descrição deve ter pelo menos 10 caracteres")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "A categoria é obrigatória")]
    public int CategoriaId { get; set; }

    [Required(ErrorMessage = "A prioridade é obrigatória")]
    public int PrioridadeId { get; set; }
}
```

### `UpdateTicketDto.cs`

```csharp
public class UpdateTicketDto
{
    public int? StatusId { get; set; }
    public int? PrioridadeId { get; set; }
    public int? ResponsavelId { get; set; }
}
```

### `CreateCommentDto.cs`

```csharp
using System.ComponentModel.DataAnnotations;

public class CreateCommentDto
{
    [Required(ErrorMessage = "O comentário é obrigatório")]
    [MinLength(1)]
    public string Comentario { get; set; } = string.Empty;

    public bool Interno { get; set; } = false;
}
```

---

## 6️⃣ Configuração de Autenticação JWT

### `Program.cs` ou `Startup.cs`

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// CORS (para desenvolvimento)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowFrontend");

app.MapControllers();
app.Run();
```

### `appsettings.json`

```json
{
  "JwtSettings": {
    "SecretKey": "SuaChaveSecretaSuperSeguraComPeloMenos32Caracteres",
    "Issuer": "ServiceDeskAPI",
    "Audience": "ServiceDeskClient",
    "ExpirationMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ServiceDesk;User Id=sa;Password=yourpassword;"
  }
}
```

---

## 7️⃣ Geração de Token JWT

### `AuthService.cs`

```csharp
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    
    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Departamento)
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Ativo);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciais inválidas");
        }

        // Verificar senha (usar BCrypt ou similar)
        if (!VerifyPassword(dto.Senha, user.SenhaHash))
        {
            throw new UnauthorizedAccessException("Credenciais inválidas");
        }

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                Role = user.Role,
                DepartamentoId = user.DepartamentoId
            }
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"]);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nome),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private bool VerifyPassword(string password, string hash)
    {
        // Implementar com BCrypt
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
```

---

## ✅ Checklist de Implementação

- [ ] Criar projeto .NET Web API
- [ ] Configurar Entity Framework Core
- [ ] Criar migrations do banco de dados
- [ ] Implementar autenticação JWT
- [ ] Criar controllers (Tickets, Dashboard, Lookups, Auth)
- [ ] Implementar services com lógica de negócio
- [ ] Adicionar validações com Data Annotations
- [ ] Implementar autorização baseada em roles
- [ ] Configurar CORS para frontend
- [ ] Adicionar logging (Serilog)
- [ ] Implementar tratamento global de erros
- [ ] Documentar API com Swagger
- [ ] Criar testes unitários
- [ ] Configurar CI/CD

---

**Conclusão:** Com estes exemplos, você tem toda a estrutura backend necessária para implementar a API completa do Service Desk! 🚀
