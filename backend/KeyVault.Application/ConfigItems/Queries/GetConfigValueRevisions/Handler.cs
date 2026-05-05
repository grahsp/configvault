using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigValueRevisions;

public sealed class Handler(
	IProjectRepository projects,
	IProjectAuthorizationService authorization,
	IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<ConfigValueRevisionSummaryView>>
{
	public async Task<IReadOnlyList<ConfigValueRevisionSummaryView>> HandleAsync(Query query, CancellationToken ct)
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

		var revisions = await db.ConfigValueRevisions
			.Where(r =>
				r.ProjectId == query.ProjectId &&
				r.ConfigItemId == query.ConfigItemId &&
				r.EnvironmentId == environment.Id)
			.OrderByDescending(r => r.Revision)
			.Select(r => new ConfigValueRevisionSummaryView(
				r.Revision,
				r.ModifiedBy.Value,
				r.ModifiedAt,
				currentRevision.HasValue && r.Revision == currentRevision.Value))
			.ToListAsync(ct);

		if (revisions.Count == 0)
		{
			var exists = await db.ConfigItems
				.AnyAsync(i => i.ProjectId == query.ProjectId && i.Id == query.ConfigItemId, ct);

			if (!exists)
				throw new ConfigItemNotFoundException(query.ConfigItemId);
		}

		return revisions;
	}
}
