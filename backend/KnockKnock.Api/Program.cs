using System.Text;
using KnockKnock.Api.Data;
using KnockKnock.Api.Features.Apply;
using KnockKnock.Api.Features.Auth;
using KnockKnock.Api.Features.Applicants;
using KnockKnock.Api.Features.Tenants;
using KnockKnock.Api.Features.Users;
using KnockKnock.Api.Services;
using Resend;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

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

builder.Services.AddSingleton<StorageService>();
builder.Services.AddOptions();
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(o =>
{
    o.ApiToken = builder.Configuration["Resend:ApiKey"]!;
});
builder.Services.AddTransient<IResend, ResendClient>();
builder.Services.AddTransient<EmailService>();
builder.Services.AddCors();

var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

// Auto-migrate and seed admin on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    if (!await db.Users.AnyAsync())
    {
        var adminEmail = builder.Configuration["Seed:AdminEmail"] ?? "admin@knockknock.hr";
        var adminPassword = builder.Configuration["Seed:AdminPassword"] ?? "admin123";

        db.Users.Add(new KnockKnock.Api.Data.Entities.User
        {
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = KnockKnock.Api.Data.Entities.UserRole.SuperAdmin
        });
        await db.SaveChangesAsync();

        app.Logger.LogInformation("Seeded super admin user: {Email}", adminEmail);
    }
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapApplyEndpoints();
app.MapAuthEndpoints();
app.MapApplicantEndpoints();
app.MapTenantEndpoints();
app.MapUserEndpoints();

app.Run();
