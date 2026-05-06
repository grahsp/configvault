using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries;

internal static class ModifierDisplayNameResolver
{
	internal const string UnknownUserDisplayName = "Unknown user";

	internal static async Task<IReadOnlyDictionary<string, string>> ResolveAsync(
		IReadDbContext db,
		IEnumerable<string> actorIds,
		CancellationToken ct)
	{
		var distinctActorIds = actorIds
			.Where(actorId => !string.IsNullOrWhiteSpace(actorId))
			.Distinct(StringComparer.Ordinal)
			.ToArray();

		if (distinctActorIds.Length == 0)
			return new Dictionary<string, string>(StringComparer.Ordinal);

		var resolvedUsers = await db.Users
			.SelectMany(user => user.ExternalLogins.Select(login => new
			{
				ActorId = "user:" + login.Issuer + ":" + login.Subject,
				user.DisplayName
			}))
			.Where(entry => distinctActorIds.Contains(entry.ActorId))
			.ToListAsync(ct);

		return resolvedUsers.ToDictionary(
			entry => entry.ActorId,
			entry => string.IsNullOrWhiteSpace(entry.DisplayName)
				? UnknownUserDisplayName
				: entry.DisplayName,
			StringComparer.Ordinal);
	}

	internal static string GetOrUnknown(
		IReadOnlyDictionary<string, string> resolvedDisplayNames,
		string actorId) =>
		resolvedDisplayNames.TryGetValue(actorId, out var displayName)
			? displayName
			: UnknownUserDisplayName;
}
