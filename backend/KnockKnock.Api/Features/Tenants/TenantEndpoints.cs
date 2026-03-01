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
