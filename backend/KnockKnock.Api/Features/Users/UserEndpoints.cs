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
