using KeyVault.Application.Persistence;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Invitations;
using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork, IReadDbContext
{
	public DbSet<User> Users { get; set; }
	IQueryable<User> IReadDbContext.Users => Users;
	
	public DbSet<Project> Projects { get; set; }
	IQueryable<Project> IReadDbContext.Projects => Projects;
	
	public DbSet<ProjectInvitation> Invitations { get; set; }
	IQueryable<ProjectInvitation> IReadDbContext.Invitations => Invitations;
	
	public DbSet<ProjectDataKey> DataKeys { get; set; }
	IQueryable<ProjectDataKey> IReadDbContext.DataKeys => DataKeys;
	
	public DbSet<Environment> Environments { get; set; }
	IQueryable<Environment> IReadDbContext.Environments => Environments;
	
	public DbSet<ConfigItem> ConfigItems { get; set; }
	IQueryable<ConfigItem> IReadDbContext.ConfigItems => ConfigItems;
	
	public DbSet<ConfigValue> ConfigValues { get; set; }
	IQueryable<ConfigValue> IReadDbContext.ConfigValues => ConfigValues;
	
	public DbSet<ProjectMember> ProjectMembers { get; set; }
	IQueryable<ProjectMember> IReadDbContext.ProjectMembers => ProjectMembers;

	public DbSet<ProjectDataKey> ProjectDataKeys { get; set; }
	
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
	}

	public async override Task<int> SaveChangesAsync(CancellationToken ct = default)
		=> await base.SaveChangesAsync(ct);
}
