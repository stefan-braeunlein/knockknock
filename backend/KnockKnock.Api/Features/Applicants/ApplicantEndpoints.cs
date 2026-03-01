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

        if (role == UserRole.CompanyUser.ToString() && applicant.TenantId.ToString() != tenantClaim)
            return Results.Forbid();

        if (applicant.CvStorageKey is null)
            return Results.NotFound(new { error = "No CV uploaded" });

        var url = storage.GetPresignedUrl(applicant.CvStorageKey);
        return Results.Ok(new { url });
    }
}
