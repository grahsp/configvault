using KeyVault.Application.Projects;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence.Repositories;

public class EfProjectRepository(AppDbContext db) : IProjectRepository
{
	public Task<Project?> GetByIdAsync(Guid id, CancellationToken ct)
		=> db.Projects
			.Include(x => x.Environments)
			.Include(x => x.Members)
			.SingleOrDefaultAsync(x => x.Id == id, ct);

	public void Add(Project project)
		=> db.Projects.Add(project);
	
	public void Remove(Project project)
		=> db.Projects.Remove(project);
}