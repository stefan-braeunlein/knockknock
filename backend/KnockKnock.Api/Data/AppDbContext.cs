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
            e.HasIndex(a => a.ConfirmationToken).IsUnique().HasFilter("\"ConfirmationToken\" IS NOT NULL");
        });
    }
}
