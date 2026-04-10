using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.GetProjectList;

public class GetProjectListQueryHandler(IUserContext user, IReadDbContext db)
	: IQueryHandler<GetProjectListQuery, IReadOnlyList<ProjectListItem>>
{
	public async Task<IReadOnlyList<ProjectListItem>> HandleAsync(GetProjectListQuery getProjectListQuery, CancellationToken ct)
	{
		return await db.Projects
			.Where(x => x.OwnerId == user.UserId)
			.OrderBy(x => x.Name)
			.Select(x => new ProjectListItem(x.Id, x.Name, x.CreatedAt))
			.ToListAsync(ct);
	}
}