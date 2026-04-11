using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Persistence;

public interface IReadDbContext
{
	IQueryable<User> Users { get; }
	IQueryable<Project> Projects { get; }
	IQueryable<ProjectMember> ProjectMembers { get; }
}