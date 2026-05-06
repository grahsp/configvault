using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.ConfigItems.Queries;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigValueRevision;

public sealed class Handler(
	IProjectRepository projects,
	IProjectAuthorizationService authorization,
	IReadDbContext db,
	IEnvelopeEncryptionService encryption)
	: IQueryHandler<Query, ConfigValueRevisionView?>
{
	public async Task<ConfigValueRevisionView?> HandleAsync(Query query, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(query.ProjectId, ct)
			?? throw new ProjectNotFoundException(query.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read),
			project);

		if (!project.TryGetEnvironment(query.EnvironmentName, out var environment))
			throw new EnvironmentNotFoundException(query.EnvironmentName);

		var currentRevision = await db.ConfigValues
			.Where(v => v.ConfigItemId == query.ConfigItemId && v.EnvironmentId == environment.Id)
			.Select(v => (uint?)v.Revision)
			.SingleOrDefaultAsync(ct);

		var revision = await db.ConfigValueRevisions
			.Where(r =>
				r.ProjectId == query.ProjectId &&
				r.ConfigItemId == query.ConfigItemId &&
				r.EnvironmentId == environment.Id &&
				r.Revision == query.Revision)
			.SingleOrDefaultAsync(ct);

		if (revision is null)
			return null;

		var modifierDisplayNames = await ModifierDisplayNameResolver.ResolveAsync(
			db,
			[revision.ModifiedBy.Value],
			ct);

		var decrypted = encryption.DecryptSecret(revision.Value, project.CurrentDataKey.Value);
		return new ConfigValueRevisionView(
			decrypted,
			revision.Revision,
			ModifierDisplayNameResolver.GetOrUnknown(modifierDisplayNames, revision.ModifiedBy.Value),
			revision.ModifiedAt,
			currentRevision.HasValue && revision.Revision == currentRevision.Value);
	}
}
