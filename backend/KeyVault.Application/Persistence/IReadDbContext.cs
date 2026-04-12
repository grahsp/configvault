using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.Persistence;

public interface IReadDbContext
{
	IQueryable<User> Users { get; }
	IQueryable<Project> Projects { get; }
	IQueryable<ProjectMember> ProjectMembers { get; }
	IQueryable<Environment> Environments { get; }
}