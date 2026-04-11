using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed class Handler(IUserContext user, IReadDbContext db)
	: IQueryHandler<Query, Response?>
{
	public Task<Response?> HandleAsync(Query query, CancellationToken ct)
	{
		return db.Projects
			.Where(p => p.Id == query.Id)
			.Select(p => new
			{
				Project = p,
				Membership = p.Members.SingleOrDefault(m => m.UserId == user.UserId)
			})
			.Where(x => x.Membership != null)
			.Select(x => new Response(
				x.Project.Id,
				x.Project.Name,
				x.Membership!.Role,
				x.Project.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}