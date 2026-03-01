# Backend & Admin Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the C# backend API and Nuxt 3 admin dashboard for the Knock Knock multi-tenant applicant management system.

**Architecture:** .NET 8 Minimal API with EF Core + Postgres for persistence, Hetzner Object Storage (S3) for CV files, JWT auth with httpOnly cookies. Nuxt 3 SPA with Tailwind CSS for the admin frontend. Docker Compose for local dev and deployment.

**Tech Stack:** .NET 8, EF Core + Npgsql, AWSSDK.S3, MailKit, BCrypt.Net, Nuxt 3, Tailwind CSS, PostgreSQL, Docker

**Design doc:** `docs/plans/2026-03-01-backend-admin-design.md`

---

### Task 1: Scaffold Backend Project

**Files:**
- Create: `backend/KnockKnock.Api/KnockKnock.Api.csproj`
- Create: `backend/KnockKnock.Api/Program.cs`
- Create: `backend/KnockKnock.Api/appsettings.json`
- Create: `backend/KnockKnock.Api/appsettings.Development.json`

**Step 1: Create the .NET project**

```bash
cd /mnt/c/Users/Anwender/repos/knock-knock
mkdir -p backend
cd backend
dotnet new web -n KnockKnock.Api --framework net8.0
```

**Step 2: Add NuGet packages**

```bash
cd KnockKnock.Api
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package AWSSDK.S3
dotnet add package MailKit
dotnet add package Microsoft.EntityFrameworkCore.Design
```

**Step 3: Configure appsettings.Development.json**

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=knockknock;Username=knockknock;Password=knockknock"
  },
  "Jwt": {
    "Secret": "dev-secret-key-at-least-32-characters-long!!",
    "Issuer": "KnockKnock",
    "ExpiryMinutes": 1440
  },
  "S3": {
    "ServiceUrl": "https://fsn1.your-objectstorage.com",
    "BucketName": "knockknock-cvs",
    "AccessKey": "",
    "SecretKey": ""
  },
  "Email": {
    "SmtpHost": "localhost",
    "SmtpPort": 1025,
    "FromAddress": "noreply@knockknock.hr",
    "FromName": "Knock Knock HR"
  },
  "BaseUrl": "http://localhost:5000"
}
```

**Step 4: Set up minimal Program.cs**

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
```

**Step 5: Verify it runs**

```bash
dotnet run
# GET http://localhost:5000/health → { "status": "ok" }
```

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat: scaffold .NET 8 backend project with dependencies"
```

---

### Task 2: Docker Compose for Local Dev

**Files:**
- Create: `docker-compose.yml`

**Step 1: Write docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: knockknock
      POSTGRES_PASSWORD: knockknock
      POSTGRES_DB: knockknock
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  pgdata:
```

Mailpit gives us a local SMTP server on port 1025 and a web UI on port 8025 to view sent emails during development.

**Step 2: Start services and verify**

```bash
docker compose up -d
# Verify Postgres: docker compose exec postgres psql -U knockknock -c "SELECT 1"
# Verify Mailpit UI: open http://localhost:8025
```

**Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose with Postgres and Mailpit"
```

---

### Task 3: EF Core DbContext & Entities

**Files:**
- Create: `backend/KnockKnock.Api/Data/AppDbContext.cs`
- Create: `backend/KnockKnock.Api/Data/Entities/Tenant.cs`
- Create: `backend/KnockKnock.Api/Data/Entities/User.cs`
- Create: `backend/KnockKnock.Api/Data/Entities/Applicant.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create entity classes**

`Tenant.cs`:
```csharp
namespace KnockKnock.Api.Data.Entities;

public class Tenant
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = [];
    public ICollection<Applicant> Applicants { get; set; } = [];
}
```

`User.cs`:
```csharp
namespace KnockKnock.Api.Data.Entities;

public enum UserRole
{
    CompanyUser,
    SuperAdmin
}

public class User
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public Guid? TenantId { get; set; }
    public UserRole Role { get; set; } = UserRole.CompanyUser;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
}
```

`Applicant.cs`:
```csharp
namespace KnockKnock.Api.Data.Entities;

public class Applicant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string AreaOfWork { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? CvStorageKey { get; set; }
    public bool EmailConfirmed { get; set; }
    public string? ConfirmationToken { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant Tenant { get; set; } = null!;
}
```

**Step 2: Create DbContext**

```csharp
using KnockKnock.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnockKnock.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Applicant> Applicants => Set<Applicant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tenant>(e =>
        {
            e.HasIndex(t => t.Slug).IsUnique();
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Tenant).WithMany(t => t.Users).HasForeignKey(u => u.TenantId);
        });

        modelBuilder.Entity<Applicant>(e =>
        {
            e.HasOne(a => a.Tenant).WithMany(t => t.Applicants).HasForeignKey(a => a.TenantId);
            e.HasIndex(a => a.ConfirmationToken).IsUnique().HasFilter("confirmation_token IS NOT NULL");
        });
    }
}
```

**Step 3: Register DbContext in Program.cs**

```csharp
using KnockKnock.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
```

**Step 4: Create and apply initial migration**

```bash
cd backend/KnockKnock.Api
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**Step 5: Verify tables exist**

```bash
docker compose exec postgres psql -U knockknock -c "\dt"
# Should show: tenants, users, applicants, __EFMigrationsHistory
```

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat: add EF Core entities, DbContext, and initial migration"
```

---

### Task 4: S3 Storage Service

**Files:**
- Create: `backend/KnockKnock.Api/Services/StorageService.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create StorageService**

```csharp
using Amazon.S3;
using Amazon.S3.Model;

namespace KnockKnock.Api.Services;

public class StorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;

    public StorageService(IConfiguration config)
    {
        var s3Config = new AmazonS3Config
        {
            ServiceURL = config["S3:ServiceUrl"],
            ForcePathStyle = true
        };
        _s3 = new AmazonS3Client(config["S3:AccessKey"], config["S3:SecretKey"], s3Config);
        _bucketName = config["S3:BucketName"]!;
    }

    public async Task<string> UploadAsync(string key, Stream stream, string contentType)
    {
        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType
        });
        return key;
    }

    public string GetPresignedUrl(string key, int expiryMinutes = 15)
    {
        return _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Verb = HttpVerb.GET
        });
    }
}
```

**Step 2: Register in Program.cs**

Add: `builder.Services.AddSingleton<StorageService>();`

**Step 3: Commit**

```bash
git add backend/
git commit -m "feat: add S3 storage service for CV uploads"
```

---

### Task 5: Email Service

**Files:**
- Create: `backend/KnockKnock.Api/Services/EmailService.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create EmailService**

```csharp
using MailKit.Net.Smtp;
using MimeKit;

namespace KnockKnock.Api.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string toName, string confirmUrl)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_config["Email:FromName"], _config["Email:FromAddress"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Bitte bestätige deine E-Mail-Adresse";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <p>Hallo {toName},</p>
                <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
                <p><a href="{confirmUrl}">{confirmUrl}</a></p>
                <p>Viele Grüße,<br/>Knock Knock HR</p>
                """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_config["Email:SmtpHost"], int.Parse(_config["Email:SmtpPort"]!), false);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
```

**Step 2: Register in Program.cs**

Add: `builder.Services.AddSingleton<EmailService>();`

**Step 3: Commit**

```bash
git add backend/
git commit -m "feat: add email service with MailKit for confirmation emails"
```

---

### Task 6: POST /api/apply Endpoint

**Files:**
- Create: `backend/KnockKnock.Api/Features/Apply/ApplyEndpoints.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create the apply endpoint**

```csharp
using KnockKnock.Api.Data;
using KnockKnock.Api.Data.Entities;
using KnockKnock.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace KnockKnock.Api.Features.Apply;

public static class ApplyEndpoints
{
    public static void MapApplyEndpoints(this WebApplication app)
    {
        app.MapPost("/api/apply", HandleApply)
            .DisableAntiforgery();

        app.MapGet("/api/confirm/{token}", HandleConfirm);
    }

    private static async Task<IResult> HandleApply(
        HttpRequest request,
        AppDbContext db,
        StorageService storage,
        EmailService email,
        IConfiguration config)
    {
        var form = await request.ReadFormAsync();

        var tenantSlug = form["tenant"].ToString();
        var firstName = form["first_name"].ToString();
        var lastName = form["last_name"].ToString();
        var emailAddr = form["email"].ToString();
        var areaOfWork = form["area_of_work"].ToString();
        var linkedinUrl = form["linkedin_url"].ToString();
        var cvFile = form.Files.GetFile("cv");

        if (string.IsNullOrWhiteSpace(tenantSlug) ||
            string.IsNullOrWhiteSpace(firstName) ||
            string.IsNullOrWhiteSpace(lastName) ||
            string.IsNullOrWhiteSpace(emailAddr) ||
            string.IsNullOrWhiteSpace(areaOfWork))
        {
            return Results.BadRequest(new { error = "Missing required fields" });
        }

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenantSlug && t.IsActive);
        if (tenant is null)
            return Results.BadRequest(new { error = "Unknown tenant" });

        string? cvKey = null;
        if (cvFile is { Length: > 0 })
        {
            cvKey = $"{tenant.Slug}/{Guid.NewGuid()}/{cvFile.FileName}";
            await using var stream = cvFile.OpenReadStream();
            await storage.UploadAsync(cvKey, stream, cvFile.ContentType);
        }

        var confirmationToken = Guid.NewGuid().ToString("N");

        var applicant = new Applicant
        {
            TenantId = tenant.Id,
            FirstName = firstName,
            LastName = lastName,
            Email = emailAddr,
            AreaOfWork = areaOfWork,
            LinkedinUrl = string.IsNullOrWhiteSpace(linkedinUrl) ? null : linkedinUrl,
            CvStorageKey = cvKey,
            ConfirmationToken = confirmationToken
        };

        db.Applicants.Add(applicant);
        await db.SaveChangesAsync();

        var baseUrl = config["BaseUrl"]!.TrimEnd('/');
        var confirmUrl = $"{baseUrl}/api/confirm/{confirmationToken}";
        await email.SendConfirmationEmailAsync(emailAddr, $"{firstName} {lastName}", confirmUrl);

        return Results.Ok(new { success = true });
    }

    private static async Task<IResult> HandleConfirm(string token, AppDbContext db)
    {
        var applicant = await db.Applicants.FirstOrDefaultAsync(a => a.ConfirmationToken == token);
        if (applicant is null)
            return Results.NotFound("Ungültiger oder abgelaufener Link.");

        applicant.EmailConfirmed = true;
        applicant.ConfirmationToken = null;
        await db.SaveChangesAsync();

        return Results.Content("""
            <!DOCTYPE html>
            <html lang="de">
            <head><meta charset="UTF-8"><title>Bestätigt</title></head>
            <body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f1f5ff">
              <div style="text-align:center">
                <h1 style="color:#0b56cf">Danke!</h1>
                <p style="color:#535d7f">Deine E-Mail-Adresse wurde erfolgreich bestätigt.</p>
              </div>
            </body>
            </html>
            """, "text/html");
    }
}
```

**Step 2: Register endpoints in Program.cs**

Add after `var app = builder.Build();`:
```csharp
app.MapApplyEndpoints();
```

**Step 3: Add CORS for widget**

In Program.cs builder section:
```csharp
builder.Services.AddCors();
```

In app section (before endpoint mapping):
```csharp
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

**Step 4: Test manually**

- Create a test tenant in the DB:
  ```bash
  docker compose exec postgres psql -U knockknock -c "INSERT INTO tenants (id, name, slug, is_active, created_at) VALUES (gen_random_uuid(), 'Demo Corp', 'demo-corp', true, now())"
  ```
- Open the widget `index.html`, add `data-endpoint="http://localhost:5000/api/apply"` to the script tag
- Submit the form, check Mailpit at http://localhost:8025 for the confirmation email
- Click the confirmation link, verify the "Danke" page appears

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add POST /api/apply and GET /api/confirm endpoints"
```

---

### Task 7: Auth — JWT Login Endpoint

**Files:**
- Create: `backend/KnockKnock.Api/Features/Auth/AuthEndpoints.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create auth endpoint**

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KnockKnock.Api.Data;
using KnockKnock.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace KnockKnock.Api.Features.Auth;

public static class AuthEndpoints
{
    public record LoginRequest(string Email, string Password);

    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", HandleLogin);
    }

    private static async Task<IResult> HandleLogin(LoginRequest request, AppDbContext db, IConfiguration config)
    {
        var user = await db.Users.Include(u => u.Tenant).FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Results.Unauthorized();

        var secret = config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        if (user.TenantId.HasValue)
            claims.Add(new Claim("tenant_id", user.TenantId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            expires: DateTime.UtcNow.AddMinutes(double.Parse(config["Jwt:ExpiryMinutes"]!)),
            claims: claims,
            signingCredentials: creds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Results.Ok(new
        {
            token = tokenString,
            role = user.Role.ToString(),
            tenantName = user.Tenant?.Name
        });
    }
}
```

**Step 2: Configure JWT auth in Program.cs**

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

// In builder section:
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });
builder.Services.AddAuthorization();

// In app section:
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
```

**Step 3: Seed a super admin user for testing**

```bash
# Generate hash for password "admin123":
# BCrypt hash of "admin123" → use dotnet script or seed in code
docker compose exec postgres psql -U knockknock -c "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (gen_random_uuid(), 'admin@knockknock.hr', '\$2a\$12\$LJ3m4ys3Lk0TSwMCfVCZnODv8s9CQsYFKzPJBqOzXqxpXvPxmKy6e', 1, now())"
```

Note: The password hash above is a placeholder. Generate a real one during implementation using `BCrypt.Net.BCrypt.HashPassword("admin123")`. Consider adding a seed command or startup seeder.

**Step 4: Test login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@knockknock.hr","password":"admin123"}'
# Should return { token: "...", role: "SuperAdmin", tenantName: null }
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add JWT auth with login endpoint"
```

---

### Task 8: Admin API — Applicants List & CV Download

**Files:**
- Create: `backend/KnockKnock.Api/Features/Applicants/ApplicantEndpoints.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create applicant endpoints**

```csharp
using System.Security.Claims;
using KnockKnock.Api.Data;
using KnockKnock.Api.Data.Entities;
using KnockKnock.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace KnockKnock.Api.Features.Applicants;

public static class ApplicantEndpoints
{
    public static void MapApplicantEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/applicants").RequireAuthorization();

        group.MapGet("/", GetApplicants);
        group.MapGet("/{id:guid}/cv", GetCvUrl);
    }

    private static async Task<IResult> GetApplicants(HttpContext http, AppDbContext db)
    {
        var role = http.User.FindFirstValue(ClaimTypes.Role);
        var tenantClaim = http.User.FindFirstValue("tenant_id");

        IQueryable<Applicant> query = db.Applicants.OrderByDescending(a => a.CreatedAt);

        if (role == UserRole.CompanyUser.ToString() && Guid.TryParse(tenantClaim, out var tenantId))
            query = query.Where(a => a.TenantId == tenantId);

        // Super admins: optionally filter by tenant via query param
        if (role == UserRole.SuperAdmin.ToString() && http.Request.Query.TryGetValue("tenant_id", out var tid) && Guid.TryParse(tid, out var filterTid))
            query = query.Where(a => a.TenantId == filterTid);

        var applicants = await query.Select(a => new
        {
            a.Id,
            a.FirstName,
            a.LastName,
            a.Email,
            a.AreaOfWork,
            a.LinkedinUrl,
            HasCv = a.CvStorageKey != null,
            a.EmailConfirmed,
            a.CreatedAt
        }).ToListAsync();

        return Results.Ok(applicants);
    }

    private static async Task<IResult> GetCvUrl(Guid id, HttpContext http, AppDbContext db, StorageService storage)
    {
        var role = http.User.FindFirstValue(ClaimTypes.Role);
        var tenantClaim = http.User.FindFirstValue("tenant_id");

        var applicant = await db.Applicants.FindAsync(id);
        if (applicant is null)
            return Results.NotFound();

        // Tenant scoping
        if (role == UserRole.CompanyUser.ToString() && applicant.TenantId.ToString() != tenantClaim)
            return Results.Forbid();

        if (applicant.CvStorageKey is null)
            return Results.NotFound(new { error = "No CV uploaded" });

        var url = storage.GetPresignedUrl(applicant.CvStorageKey);
        return Results.Redirect(url);
    }
}
```

**Step 2: Register in Program.cs**

Add: `app.MapApplicantEndpoints();`

**Step 3: Test with JWT**

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@knockknock.hr","password":"admin123"}' | jq -r .token)

curl http://localhost:5000/api/applicants -H "Authorization: Bearer $TOKEN"
```

**Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add applicant list and CV download endpoints"
```

---

### Task 9: Admin API — Tenants CRUD

**Files:**
- Create: `backend/KnockKnock.Api/Features/Tenants/TenantEndpoints.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create tenant endpoints**

```csharp
using KnockKnock.Api.Data;
using KnockKnock.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnockKnock.Api.Features.Tenants;

public static class TenantEndpoints
{
    public record CreateTenantRequest(string Name, string Slug);
    public record UpdateTenantRequest(string Name, bool IsActive);

    public static void MapTenantEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tenants")
            .RequireAuthorization(policy => policy.RequireRole(UserRole.SuperAdmin.ToString()));

        group.MapGet("/", async (AppDbContext db) =>
        {
            var tenants = await db.Tenants
                .OrderBy(t => t.Name)
                .Select(t => new { t.Id, t.Name, t.Slug, t.IsActive, t.CreatedAt })
                .ToListAsync();
            return Results.Ok(tenants);
        });

        group.MapPost("/", async (CreateTenantRequest request, AppDbContext db) =>
        {
            if (await db.Tenants.AnyAsync(t => t.Slug == request.Slug))
                return Results.Conflict(new { error = "Slug already exists" });

            var tenant = new Tenant { Name = request.Name, Slug = request.Slug };
            db.Tenants.Add(tenant);
            await db.SaveChangesAsync();
            return Results.Created($"/api/tenants/{tenant.Id}", new { tenant.Id, tenant.Name, tenant.Slug });
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateTenantRequest request, AppDbContext db) =>
        {
            var tenant = await db.Tenants.FindAsync(id);
            if (tenant is null) return Results.NotFound();

            tenant.Name = request.Name;
            tenant.IsActive = request.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok(new { tenant.Id, tenant.Name, tenant.Slug, tenant.IsActive });
        });
    }
}
```

**Step 2: Register in Program.cs**

Add: `app.MapTenantEndpoints();`

**Step 3: Commit**

```bash
git add backend/
git commit -m "feat: add tenant CRUD endpoints (super_admin only)"
```

---

### Task 10: Admin API — Users CRUD

**Files:**
- Create: `backend/KnockKnock.Api/Features/Users/UserEndpoints.cs`
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Create user endpoints**

```csharp
using KnockKnock.Api.Data;
using KnockKnock.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnockKnock.Api.Features.Users;

public static class UserEndpoints
{
    public record CreateUserRequest(string Email, string Password, Guid? TenantId, UserRole Role);

    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users")
            .RequireAuthorization(policy => policy.RequireRole(UserRole.SuperAdmin.ToString()));

        group.MapGet("/", async (AppDbContext db) =>
        {
            var users = await db.Users
                .Include(u => u.Tenant)
                .OrderBy(u => u.Email)
                .Select(u => new { u.Id, u.Email, u.Role, TenantName = u.Tenant != null ? u.Tenant.Name : null, u.CreatedAt })
                .ToListAsync();
            return Results.Ok(users);
        });

        group.MapPost("/", async (CreateUserRequest request, AppDbContext db) =>
        {
            if (await db.Users.AnyAsync(u => u.Email == request.Email))
                return Results.Conflict(new { error = "Email already exists" });

            var user = new User
            {
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                TenantId = request.TenantId,
                Role = request.Role
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Created($"/api/users/{user.Id}", new { user.Id, user.Email, user.Role });
        });
    }
}
```

**Step 2: Register in Program.cs**

Add: `app.MapUserEndpoints();`

**Step 3: Commit**

```bash
git add backend/
git commit -m "feat: add user CRUD endpoints (super_admin only)"
```

---

### Task 11: Update Widget POST Field Names

**Files:**
- Modify: `widget/knock-knock.js`

**Step 1: Update FormData keys in the submit handler**

In `knock-knock.js`, find the submit handler (around line 273-279) and change:

```javascript
// Before:
formData.append("vorname", ...);
formData.append("nachname", ...);
formData.append("email", ...);
formData.append("einsatzbereich", ...);
formData.append("linkedin", ...);
if (companyId) formData.append("company", companyId);
if (fileInput.files.length > 0) formData.append("lebenslauf", fileInput.files[0]);

// After:
formData.append("first_name", ...);
formData.append("last_name", ...);
formData.append("email", ...);
formData.append("area_of_work", ...);
formData.append("linkedin_url", ...);
if (companyId) formData.append("tenant", companyId);
if (fileInput.files.length > 0) formData.append("cv", fileInput.files[0]);
```

The `name` attributes on the HTML inputs can stay as-is (they're only used for `querySelector`, not submitted). The UI labels remain German.

**Step 2: Verify the widget still works**

Open `widget/index.html` with `data-endpoint="http://localhost:5000/api/apply"`, submit, confirm the backend receives the correct field names.

**Step 3: Commit**

```bash
git add widget/
git commit -m "feat: rename widget POST fields to English (first_name, last_name, etc.)"
```

---

### Task 12: Scaffold Nuxt 3 Admin Frontend

**Files:**
- Create: `admin/` (entire Nuxt project)

**Step 1: Create Nuxt project**

```bash
cd /mnt/c/Users/Anwender/repos/knock-knock
npx nuxi@latest init admin
cd admin
npm install
```

**Step 2: Add Tailwind CSS**

```bash
npx nuxi module add @nuxtjs/tailwindcss
```

**Step 3: Configure nuxt.config.ts**

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5000'
    }
  }
})
```

**Step 4: Verify it runs**

```bash
npm run dev
# Open http://localhost:3000
```

**Step 5: Commit**

```bash
git add admin/
git commit -m "feat: scaffold Nuxt 3 admin with Tailwind CSS"
```

---

### Task 13: Admin — Auth Composable & Middleware

**Files:**
- Create: `admin/composables/useAuth.ts`
- Create: `admin/composables/useApi.ts`
- Create: `admin/middleware/auth.global.ts`

**Step 1: Create useAuth composable**

```typescript
// admin/composables/useAuth.ts
interface AuthState {
  token: string | null
  role: string | null
  tenantName: string | null
}

export function useAuth() {
  const state = useState<AuthState>('auth', () => ({
    token: localStorage.getItem('kk_token'),
    role: localStorage.getItem('kk_role'),
    tenantName: localStorage.getItem('kk_tenant_name')
  }))

  function setAuth(token: string, role: string, tenantName: string | null) {
    state.value = { token, role, tenantName }
    localStorage.setItem('kk_token', token)
    localStorage.setItem('kk_role', role)
    if (tenantName) localStorage.setItem('kk_tenant_name', tenantName)
  }

  function logout() {
    state.value = { token: null, role: null, tenantName: null }
    localStorage.removeItem('kk_token')
    localStorage.removeItem('kk_role')
    localStorage.removeItem('kk_tenant_name')
    navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!state.value.token)
  const isSuperAdmin = computed(() => state.value.role === 'SuperAdmin')

  return { state, setAuth, logout, isAuthenticated, isSuperAdmin }
}
```

**Step 2: Create useApi composable**

```typescript
// admin/composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig()
  const { state, logout } = useAuth()

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${config.public.apiBase}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(state.value.token ? { Authorization: `Bearer ${state.value.token}` } : {}),
        ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {})
      }
    })

    if (res.status === 401) {
      logout()
      throw new Error('Unauthorized')
    }

    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }

  return { apiFetch }
}
```

**Step 3: Create auth middleware**

```typescript
// admin/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const { isAuthenticated } = useAuth()

  if (to.path !== '/login' && !isAuthenticated.value) {
    return navigateTo('/login')
  }

  if (to.path === '/login' && isAuthenticated.value) {
    return navigateTo('/applicants')
  }
})
```

**Step 4: Commit**

```bash
git add admin/
git commit -m "feat: add auth composable, API helper, and auth middleware"
```

---

### Task 14: Admin — Login Page

**Files:**
- Create: `admin/pages/login.vue`

**Step 1: Create login page**

```vue
<script setup lang="ts">
definePageMeta({ layout: false })

const { setAuth } = useAuth()
const { apiFetch } = useApi()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const data = await apiFetch<{ token: string; role: string; tenantName: string | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    setAuth(data.token, data.role, data.tenantName)
    navigateTo('/applicants')
  } catch {
    error.value = 'Ungültige Anmeldedaten.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-sm p-10 w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-blue-700">Knock Knock</h1>
        <p class="text-gray-500 text-sm mt-1">Admin Login</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="email" type="email" placeholder="E-Mail" required
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="password" type="password" placeholder="Passwort" required
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="w-full py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
          {{ loading ? 'Laden...' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>
```

**Step 2: Verify login flow**

- Run Nuxt dev server, navigate to `/login`
- Enter credentials, verify redirect to `/applicants`

**Step 3: Commit**

```bash
git add admin/
git commit -m "feat: add admin login page"
```

---

### Task 15: Admin — Default Layout (Sidebar)

**Files:**
- Create: `admin/layouts/default.vue`

**Step 1: Create sidebar layout matching the screenshot**

```vue
<script setup lang="ts">
const { isSuperAdmin, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-72 bg-blue-50 border border-blue-200 border-dashed rounded-2xl m-4 p-6 flex flex-col">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <span class="text-white text-2xl">👋</span>
        </div>
        <h2 class="text-xl font-bold text-blue-700">Knock Knock</h2>
        <p class="text-gray-500 text-sm mt-1">Initiativ. Konversionsstark. Einzigartig.</p>
      </div>

      <nav class="flex-1 space-y-1">
        <NuxtLink to="/applicants"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
          active-class="bg-blue-100 font-semibold">
          <span>👥</span> Bewerber / Interessenten
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/tenants"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
          active-class="bg-blue-100 font-semibold">
          <span>🏢</span> Unternehmen
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/users"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
          active-class="bg-blue-100 font-semibold">
          <span>⚙️</span> Benutzer
        </NuxtLink>
      </nav>

      <div class="mt-auto">
        <button @click="logout"
          class="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm">
          ⏻ Logout
        </button>
        <p class="text-gray-400 text-xs mt-4">Powered by <strong class="text-gray-600">Knock Knock HR</strong></p>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add admin/
git commit -m "feat: add sidebar layout matching design"
```

---

### Task 16: Admin — Applicants Page

**Files:**
- Create: `admin/pages/applicants.vue`

**Step 1: Create applicants page with grouped table**

```vue
<script setup lang="ts">
const { apiFetch } = useApi()
const config = useRuntimeConfig()

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  areaOfWork: string
  linkedinUrl: string | null
  hasCv: boolean
  emailConfirmed: boolean
  createdAt: string
}

const { data: applicants } = await useAsyncData('applicants', () =>
  apiFetch<Applicant[]>('/api/applicants')
)

const grouped = computed(() => {
  if (!applicants.value) return []
  const groups: Record<string, Applicant[]> = {}
  for (const a of applicants.value) {
    const date = new Date(a.createdAt)
    const key = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    ;(groups[key] ??= []).push(a)
  }
  return Object.entries(groups)
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) + ' Uhr'
}

function cvUrl(id: string) {
  return `${config.public.apiBase}/api/applicants/${id}/cv`
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Bewerberliste</h1>

    <div v-for="[month, items] in grouped" :key="month" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">{{ month }}</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b">
            <th class="py-2 font-medium">Datum</th>
            <th class="py-2 font-medium">Vorname</th>
            <th class="py-2 font-medium">Nachname</th>
            <th class="py-2 font-medium">Einsatzbereich</th>
            <th class="py-2 font-medium">LinkedIn</th>
            <th class="py-2 font-medium">Lebenslauf</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id" class="border-b border-gray-100"
            :class="{ 'opacity-60': !a.emailConfirmed }">
            <td class="py-3">{{ formatDate(a.createdAt) }}</td>
            <td class="py-3">{{ a.firstName }}</td>
            <td class="py-3">{{ a.lastName }}</td>
            <td class="py-3">{{ a.areaOfWork }}</td>
            <td class="py-3">
              <a v-if="a.linkedinUrl" :href="a.linkedinUrl" target="_blank" class="text-blue-600 font-semibold hover:underline">
                Profil anschauen
              </a>
            </td>
            <td class="py-3">
              <a v-if="a.hasCv" :href="cvUrl(a.id)" target="_blank" class="text-blue-600 font-semibold hover:underline">
                Lebenslauf anschauen
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!applicants?.length" class="text-gray-400">Noch keine Bewerbungen vorhanden.</p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add admin/
git commit -m "feat: add applicants page with grouped table"
```

---

### Task 17: Admin — Tenants Page (Super Admin)

**Files:**
- Create: `admin/pages/tenants.vue`

**Step 1: Create tenants page with list + create form**

```vue
<script setup lang="ts">
const { apiFetch } = useApi()

interface Tenant {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
}

const tenants = ref<Tenant[]>([])
const newName = ref('')
const newSlug = ref('')

async function load() {
  tenants.value = await apiFetch<Tenant[]>('/api/tenants')
}

async function create() {
  await apiFetch('/api/tenants', {
    method: 'POST',
    body: JSON.stringify({ name: newName.value, slug: newSlug.value })
  })
  newName.value = ''
  newSlug.value = ''
  await load()
}

async function toggleActive(t: Tenant) {
  await apiFetch(`/api/tenants/${t.id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: t.name, isActive: !t.isActive })
  })
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Unternehmen</h1>

    <!-- Create form -->
    <form @submit.prevent="create" class="flex gap-3 mb-8">
      <input v-model="newName" placeholder="Name" required
        class="px-4 py-2 border border-gray-200 rounded-lg flex-1" />
      <input v-model="newSlug" placeholder="Slug (für Widget)" required
        class="px-4 py-2 border border-gray-200 rounded-lg flex-1" />
      <button type="submit" class="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
        Erstellen
      </button>
    </form>

    <!-- Table -->
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b">
          <th class="py-2 font-medium">Name</th>
          <th class="py-2 font-medium">Slug</th>
          <th class="py-2 font-medium">Status</th>
          <th class="py-2 font-medium">Aktion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tenants" :key="t.id" class="border-b border-gray-100">
          <td class="py-3">{{ t.name }}</td>
          <td class="py-3 font-mono text-gray-500">{{ t.slug }}</td>
          <td class="py-3">
            <span :class="t.isActive ? 'text-green-600' : 'text-red-500'">
              {{ t.isActive ? 'Aktiv' : 'Inaktiv' }}
            </span>
          </td>
          <td class="py-3">
            <button @click="toggleActive(t)" class="text-blue-600 hover:underline text-sm">
              {{ t.isActive ? 'Deaktivieren' : 'Aktivieren' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add admin/
git commit -m "feat: add tenants management page"
```

---

### Task 18: Admin — Users Page (Super Admin)

**Files:**
- Create: `admin/pages/users.vue`

**Step 1: Create users page with list + create form**

```vue
<script setup lang="ts">
const { apiFetch } = useApi()

interface User {
  id: string
  email: string
  role: string
  tenantName: string | null
  createdAt: string
}

interface Tenant {
  id: string
  name: string
}

const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const newEmail = ref('')
const newPassword = ref('')
const newTenantId = ref<string | undefined>()
const newRole = ref<'CompanyUser' | 'SuperAdmin'>('CompanyUser')

async function load() {
  users.value = await apiFetch<User[]>('/api/users')
  tenants.value = await apiFetch<Tenant[]>('/api/tenants')
}

async function create() {
  await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      email: newEmail.value,
      password: newPassword.value,
      tenantId: newRole.value === 'CompanyUser' ? newTenantId.value : null,
      role: newRole.value === 'SuperAdmin' ? 1 : 0
    })
  })
  newEmail.value = ''
  newPassword.value = ''
  newTenantId.value = undefined
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Benutzer</h1>

    <!-- Create form -->
    <form @submit.prevent="create" class="flex flex-wrap gap-3 mb-8">
      <input v-model="newEmail" type="email" placeholder="E-Mail" required
        class="px-4 py-2 border border-gray-200 rounded-lg" />
      <input v-model="newPassword" type="password" placeholder="Passwort" required
        class="px-4 py-2 border border-gray-200 rounded-lg" />
      <select v-model="newRole" class="px-4 py-2 border border-gray-200 rounded-lg">
        <option value="CompanyUser">Unternehmens-Benutzer</option>
        <option value="SuperAdmin">Super Admin</option>
      </select>
      <select v-if="newRole === 'CompanyUser'" v-model="newTenantId"
        class="px-4 py-2 border border-gray-200 rounded-lg">
        <option disabled :value="undefined">Unternehmen wählen...</option>
        <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button type="submit" class="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
        Erstellen
      </button>
    </form>

    <!-- Table -->
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b">
          <th class="py-2 font-medium">E-Mail</th>
          <th class="py-2 font-medium">Rolle</th>
          <th class="py-2 font-medium">Unternehmen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-b border-gray-100">
          <td class="py-3">{{ u.email }}</td>
          <td class="py-3">{{ u.role === 'SuperAdmin' ? 'Super Admin' : 'Benutzer' }}</td>
          <td class="py-3">{{ u.tenantName ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add admin/
git commit -m "feat: add users management page"
```

---

### Task 19: Final Program.cs Assembly

**Files:**
- Modify: `backend/KnockKnock.Api/Program.cs`

**Step 1: Assemble the complete Program.cs**

This is the final version bringing together all registrations from previous tasks:

```csharp
using System.Text;
using KnockKnock.Api.Data;
using KnockKnock.Api.Features.Apply;
using KnockKnock.Api.Features.Auth;
using KnockKnock.Api.Features.Applicants;
using KnockKnock.Api.Features.Tenants;
using KnockKnock.Api.Features.Users;
using KnockKnock.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });
builder.Services.AddAuthorization();

// Services
builder.Services.AddSingleton<StorageService>();
builder.Services.AddSingleton<EmailService>();

// CORS
builder.Services.AddCors();

var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapApplyEndpoints();
app.MapAuthEndpoints();
app.MapApplicantEndpoints();
app.MapTenantEndpoints();
app.MapUserEndpoints();

app.Run();
```

**Step 2: Verify everything compiles and runs**

```bash
cd backend/KnockKnock.Api
dotnet build
dotnet run
```

**Step 3: Commit**

```bash
git add backend/
git commit -m "feat: assemble final Program.cs with all endpoints"
```

---

### Task 20: End-to-End Smoke Test

**Step 1: Start all services**

```bash
docker compose up -d
cd backend/KnockKnock.Api && dotnet run &
cd admin && npm run dev &
```

**Step 2: Seed test data**

```bash
# Create tenant
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@knockknock.hr","password":"admin123"}'
# Use the token to create a tenant and a company user via the API
```

**Step 3: Test the full flow**

1. Open widget → submit application → check Mailpit for confirmation email
2. Click confirmation link → verify "Danke" page
3. Open admin at http://localhost:3000 → login → see the applicant in the list
4. Click "Lebenslauf anschauen" → verify CV download
5. Navigate to Unternehmen / Benutzer pages as super admin

**Step 4: Commit any fixes**

```bash
git add .
git commit -m "chore: end-to-end smoke test fixes"
```

---

## Summary

| Task | What | Estimated Steps |
|------|------|-----------------|
| 1 | Scaffold backend | 6 |
| 2 | Docker Compose | 3 |
| 3 | EF Core entities + migration | 6 |
| 4 | S3 storage service | 3 |
| 5 | Email service | 3 |
| 6 | POST /api/apply + confirm | 5 |
| 7 | JWT auth + login | 5 |
| 8 | Applicants API | 4 |
| 9 | Tenants CRUD API | 3 |
| 10 | Users CRUD API | 3 |
| 11 | Widget field rename | 3 |
| 12 | Scaffold Nuxt admin | 5 |
| 13 | Auth composable + middleware | 4 |
| 14 | Login page | 3 |
| 15 | Sidebar layout | 2 |
| 16 | Applicants page | 2 |
| 17 | Tenants page | 2 |
| 18 | Users page | 2 |
| 19 | Final Program.cs | 3 |
| 20 | E2E smoke test | 4 |
