using KeyVault.Application.Persistence;
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
	
	public DbSet<Environment> Environments { get; set; }
	IQueryable<Environment> IReadDbContext.Environments => Environments;
	
	public DbSet<ProjectMember> ProjectMembers { get; set; }
	IQueryable<ProjectMember> IReadDbContext.ProjectMembers => ProjectMembers;
	
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
	}

	public async override Task<int> SaveChangesAsync(CancellationToken ct = default)
		=> await base.SaveChangesAsync(ct);
}