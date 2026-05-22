using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries;

public sealed record GetProjectQuery(Guid ProjectId) : IQuery<GetProjectResponse?>;
public sealed record GetProjectResponse(
	Guid Id,
	string Name,
	ProjectRole Role,
	DateTimeOffset CreatedAt);

public sealed class GetProjectQueryHandler(
	IActorContext actor,
	IReadDbContext db)
	: IQueryHandler<GetProjectQuery, GetProjectResponse?>
{
	public async Task<GetProjectResponse?> HandleAsync(GetProjectQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.Where(p => p.Members.Any(m => p.Id == query.ProjectId && m.UserId == userId))
			.Select(p => new GetProjectResponse(
				p.Id,
				p.Name,
				p.Members
					.Where(m => m.UserId == userId)
					.Select(m => m.Role)
					.Single(),
				p.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}
