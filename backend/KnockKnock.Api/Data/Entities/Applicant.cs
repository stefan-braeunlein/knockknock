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
