using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Invitations;
using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.Persistence;

public interface IReadDbContext
{
	IQueryable<User> Users { get; }
	IQueryable<Project> Projects { get; }
	IQueryable<ProjectDataKey> DataKeys { get; }
	IQueryable<Environment> Environments { get; }
	IQueryable<ConfigItem> ConfigItems { get; }
	IQueryable<ConfigValue> ConfigValues { get; }
	IQueryable<ConfigValueRevision> ConfigValueRevisions { get; }
	IQueryable<ProjectMember> ProjectMembers { get; }
	IQueryable<ProjectInvitation> Invitations { get; }
}
