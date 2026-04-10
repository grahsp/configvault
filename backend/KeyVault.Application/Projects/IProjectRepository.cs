using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects;

public interface IProjectRepository
{
	Task<Project?> GetByIdAsync(Guid id, CancellationToken ct);
	void Add(Project project);
	void Remove(Project project);
}