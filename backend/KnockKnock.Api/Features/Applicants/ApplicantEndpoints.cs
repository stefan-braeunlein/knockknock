using System.Security.Claims;
using ClosedXML.Excel;
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
        group.MapGet("/export", ExportApplicants);
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

    private static async Task<IResult> ExportApplicants(HttpContext http, AppDbContext db, IConfiguration config, int year, int month)
    {
        var role = http.User.FindFirstValue(ClaimTypes.Role);
        var tenantClaim = http.User.FindFirstValue("tenant_id");

        IQueryable<Applicant> query = db.Applicants
            .Where(a => a.CreatedAt.Year == year && a.CreatedAt.Month == month)
            .OrderByDescending(a => a.CreatedAt);

        if (role == UserRole.CompanyUser.ToString() && Guid.TryParse(tenantClaim, out var tenantId))
            query = query.Where(a => a.TenantId == tenantId);

        if (role == UserRole.SuperAdmin.ToString() && http.Request.Query.TryGetValue("tenant_id", out var tid) && Guid.TryParse(tid, out var filterTid))
            query = query.Where(a => a.TenantId == filterTid);

        var applicants = await query.ToListAsync();

        using var workbook = new XLWorkbook();
        var monthName = new DateTime(year, month, 1).ToString("MMMM yyyy", new System.Globalization.CultureInfo("de-DE"));
        var ws = workbook.Worksheets.Add(monthName);

        ws.Cell(1, 1).Value = "Datum";
        ws.Cell(1, 2).Value = "Vorname";
        ws.Cell(1, 3).Value = "Nachname";
        ws.Cell(1, 4).Value = "Tätigkeitsbereich";
        ws.Cell(1, 5).Value = "E-Mail Adresse";
        ws.Cell(1, 6).Value = "LinkedIn";
        ws.Cell(1, 7).Value = "Lebenslauf";

        var headerRow = ws.Range(1, 1, 1, 7);
        headerRow.Style.Font.Bold = true;

        var adminUrl = (config["AdminUrl"] ?? "https://getknockknock.de/admin").TrimEnd('/');

        for (var i = 0; i < applicants.Count; i++)
        {
            var a = applicants[i];
            var row = i + 2;
            ws.Cell(row, 1).Value = a.CreatedAt.ToString("dd.MM.yyyy HH:mm") + " Uhr";
            ws.Cell(row, 2).Value = a.FirstName;
            ws.Cell(row, 3).Value = a.LastName;
            ws.Cell(row, 4).Value = a.AreaOfWork;
            ws.Cell(row, 5).Value = a.Email;
            ws.Cell(row, 6).Value = a.LinkedinUrl ?? "";
            if (a.CvStorageKey is not null)
            {
                var cvUrl = $"{adminUrl}/cv/{a.Id}";
                ws.Cell(row, 7).SetValue("Herunterladen");
                ws.Cell(row, 7).SetHyperlink(new XLHyperlink(cvUrl));
                ws.Cell(row, 7).Style.Font.FontColor = XLColor.FromHtml("#0B56CF");
                ws.Cell(row, 7).Style.Font.Underline = XLFontUnderlineValues.Single;
            }
        }

        ws.Columns().AdjustToContents();

        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        var fileName = $"Bewerbungen_{monthName.Replace(" ", "_")}.xlsx";
        return Results.File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
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
