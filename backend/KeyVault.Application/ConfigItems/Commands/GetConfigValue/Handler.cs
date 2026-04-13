using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Commands.GetConfigValue;

public sealed class Handler(IUserContext user, IReadDbContext db) : IQueryHandler<Query, ConfigValueView?>
{
	public async Task<ConfigValueView?> HandleAsync(Query query, CancellationToken ct)
	{
		return await db.ConfigValues
			.Where(v => v.ConfigItemId == query.ConfigItemId)
			.Where(v => v.Environment.Name == query.EnvironmentName)
			.Where(v => v.ConfigItem.ProjectId == query.ProjectId)
			.Where(v => v.ConfigItem.Project.Members.Any(m => m.UserId == user.UserId))
			.Select(v => new ConfigValueView(v.Value, v.LastModifiedAt))
			.SingleOrDefaultAsync(ct);
	}
}