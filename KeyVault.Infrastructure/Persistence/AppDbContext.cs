using KeyVault.Application.Persistence;
using KeyVault.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork, IReadDbContext
{
	public DbSet<User> Users { get; set; }
	IQueryable<User> IReadDbContext.Users => Users;
	
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
	}

	public async override Task<int> SaveChangesAsync(CancellationToken ct = default)
		=> await base.SaveChangesAsync(ct);
}