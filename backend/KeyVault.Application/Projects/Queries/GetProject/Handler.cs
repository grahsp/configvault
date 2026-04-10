using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed class Handler(IUserContext user, IReadDbContext db)
	: IQueryHandler<Query, ProjectDetails?>
{
	public Task<ProjectDetails?> HandleAsync(Query query, CancellationToken ct)
	{
		return db.Projects
			.Where(x => x.Id == query.Id && user.UserId == x.OwnerId)
			.Select(x => new ProjectDetails(x.Id, x.Name, x.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}