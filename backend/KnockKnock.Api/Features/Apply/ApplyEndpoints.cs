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
        var confirmUrl = $"{baseUrl}/confirm/{confirmationToken}";
        await email.SendConfirmationEmailAsync(emailAddr, $"{firstName} {lastName}", confirmUrl, tenant.Name);

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
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Bestätigt</title>
              <style>
                @font-face { font-family: 'Open Sans'; font-weight: 400; src: url(/fonts/open-sans-400-latin.woff2) format('woff2'); }
                @font-face { font-family: 'Open Sans'; font-weight: 700; src: url(/fonts/open-sans-700-latin.woff2) format('woff2'); }
              </style>
            </head>
            <body style="font-family:'Open Sans',sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f1f5ff">
              <div style="text-align:center">
                <img src="/knock-knock-logo.svg" alt="Knock Knock" width="70" height="70" style="margin-bottom:20px">
                <h1 style="color:#0b56cf;font-size:24px;font-weight:700;margin:0 0 12px">Erfolgreich bestätigt!</h1>
                <p style="color:#535d7f;font-size:16px;margin:0;line-height:1.5">Deine Kontaktdaten wurden bei dem<br>Unternehmen aufgenommen.</p>
              </div>
            </body>
            </html>
            """, "text/html");
    }
}
