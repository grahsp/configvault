using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.GetProjectDetails;

public sealed class GetProjectDetailsQueryHandler(IUserContext user, IReadDbContext db)
	: IQueryHandler<GetProjectDetailsQuery, ProjectDetails?>
{
	public Task<ProjectDetails?> HandleAsync(GetProjectDetailsQuery query, CancellationToken ct)
	{
		return db.Projects
			.Where(x => x.Id == query.Id && user.UserId == x.OwnerId)
			.Select(x => new ProjectDetails(x.Id, x.Name, x.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}