using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries;

public sealed record GetExportedValuesQuery(Guid ProjectId, string EnvironmentName) : IQuery<IReadOnlyList<ConfigKeyValue>>;

public sealed class GetExportedValuesQueryHandler(
	IReadDbContext db,
	IActorContext actor,
	IEnvelopeEncryptionService encryption)
	: IQueryHandler<GetExportedValuesQuery, IReadOnlyList<ConfigKeyValue>>
{
	public async Task<IReadOnlyList<ConfigKeyValue>> HandleAsync(GetExportedValuesQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		var result = await db.Environments
			.Where(e => e.ProjectId == query.ProjectId)
			.Where(e => e.Name == query.EnvironmentName)
			.Where(e => e.Project.Members.Any(m => m.UserId == userId))
			.Select(e => new
			{
				EnvironmentId = e.Id,
				DataKey = db.DataKeys
					.Where(k => k.Id == e.Project.CurrentDataKeyId)
					.Select(k => k.Value)
					.Single()
			})
			.SingleOrDefaultAsync(ct);

		if (result is null)
			throw new NotFoundException();

		var kvps = await db.ConfigValues
			.Where(v => v.EnvironmentId == result.EnvironmentId)
			.Where(v => v.ConfigItem.ProjectId == query.ProjectId)
			.OrderBy(v => v.ConfigItem.Key)
			.Select(v => new
			{
				v.ConfigItem.Key,
				v.Value,
			})
			.ToListAsync(ct);

		return kvps
			.Select(kvp => new ConfigKeyValue(
				kvp.Key.Value,
				encryption.DecryptSecret(kvp.Value, result.DataKey)))
			.ToList();
	}
}
