using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetProjects;

public class Handler(IUserContext user, IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<ProjectListItem>>
{
	public async Task<IReadOnlyList<ProjectListItem>> HandleAsync(Query query, CancellationToken ct)
	{
		return await db.Projects
			.Where(x => x.OwnerId == user.UserId)
			.OrderBy(x => x.Name)
			.Select(x => new ProjectListItem(x.Id, x.Name, x.CreatedAt))
			.ToListAsync(ct);
	}
}