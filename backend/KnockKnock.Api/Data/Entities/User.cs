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
