using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using KeyVault.Infrastructure.Persistence;
using KeyVault.Tests.Integration.Fixtures;
using KeyVault.Tests.Integration.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.ConfigItems;

public sealed class ConfigValueRevisionEndpointTests(TestFixture fixture) : IClassFixture<TestFixture>
{
	[Fact]
	public async Task ValueEndpoints_ShouldTrackHistoryAndRestoreByCopyForward()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("revision-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var firstSet = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v1", expectedRevision = 0 });
		firstSet.EnsureSuccessStatusCode();

		var secondSet = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v2", expectedRevision = 1 });
		secondSet.EnsureSuccessStatusCode();

		var current = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production");
		current.EnsureSuccessStatusCode();

		using (var payload = JsonDocument.Parse(await current.Content.ReadAsStringAsync()))
		{
			Assert.Equal("secret-v2", payload.RootElement.GetProperty("value").GetString());
			Assert.Equal(2u, payload.RootElement.GetProperty("revision").GetUInt32());
		}

		var history = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value/revisions?environment=production");
		history.EnsureSuccessStatusCode();

		using (var payload = JsonDocument.Parse(await history.Content.ReadAsStringAsync()))
		{
			var revisions = payload.RootElement.EnumerateArray().ToArray();
			Assert.Equal(2, revisions.Length);
			Assert.Equal(2u, revisions[0].GetProperty("revision").GetUInt32());
			Assert.Equal("user-revisi", revisions[0].GetProperty("createdByDisplayName").GetString());
			Assert.True(revisions[0].GetProperty("isCurrent").GetBoolean());
			Assert.Equal(1u, revisions[1].GetProperty("revision").GetUInt32());
			Assert.Equal("user-revisi", revisions[1].GetProperty("createdByDisplayName").GetString());
			Assert.False(revisions[1].GetProperty("isCurrent").GetBoolean());
		}

		var revisionDetail = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value/revisions/1?environment=production");
		revisionDetail.EnsureSuccessStatusCode();

		using (var payload = JsonDocument.Parse(await revisionDetail.Content.ReadAsStringAsync()))
		{
			Assert.Equal("secret-v1", payload.RootElement.GetProperty("value").GetString());
			Assert.Equal(1u, payload.RootElement.GetProperty("revision").GetUInt32());
			Assert.Equal("user-revisi", payload.RootElement.GetProperty("createdByDisplayName").GetString());
			Assert.False(payload.RootElement.GetProperty("isCurrent").GetBoolean());
		}

		var restore = await client.PostAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value/revisions/1/restore?environment=production",
			new { expectedRevision = 2 });
		restore.EnsureSuccessStatusCode();

		var restored = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production");
		restored.EnsureSuccessStatusCode();

		using (var payload = JsonDocument.Parse(await restored.Content.ReadAsStringAsync()))
		{
			Assert.Equal("secret-v1", payload.RootElement.GetProperty("value").GetString());
			Assert.Equal(3u, payload.RootElement.GetProperty("revision").GetUInt32());
		}
	}

	[Fact]
	public async Task RevisionHistory_ShouldReturnResolvedModifierDisplayName()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("revision-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var setValue = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v1", expectedRevision = 0 });
		setValue.EnsureSuccessStatusCode();

		var history = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value/revisions?environment=production");
		history.EnsureSuccessStatusCode();

		using var payload = JsonDocument.Parse(await history.Content.ReadAsStringAsync());
		var revision = payload.RootElement.EnumerateArray().Single();
		Assert.Equal("user-revisi", revision.GetProperty("createdByDisplayName").GetString());
	}

	[Fact]
	public async Task SecretsList_ShouldIncludeCurrentRevisionForSelectedEnvironment()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("revision-owner");
		var projectId = await CreateProjectAsync(client);
		var withValueId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");
		await CreateConfigItemAsync(client, host, projectId, "DATABASE_URL");

		var setValue = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{withValueId}/value?environment=production",
			new { value = "secret-v1", expectedRevision = 0 });
		setValue.EnsureSuccessStatusCode();

		var response = await client.GetAsync(
			$"/projects/{projectId}/secrets?environment=production");
		response.EnsureSuccessStatusCode();

		using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
		var secrets = payload.RootElement.EnumerateArray().ToArray();
		Assert.Equal(2, secrets.Length);
		Assert.Equal(1u, secrets[0].GetProperty("revision").GetUInt32());
		Assert.True(secrets[0].GetProperty("hasValue").GetBoolean());
		Assert.Equal(0u, secrets[1].GetProperty("revision").GetUInt32());
		Assert.False(secrets[1].GetProperty("hasValue").GetBoolean());
	}

	[Fact]
	public async Task RevisionEndpoints_ShouldReturnUnknownUser_WhenModifierCannotBeResolved()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("revision-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var setValue = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v1", expectedRevision = 0 });
		setValue.EnsureSuccessStatusCode();

		await host.WithScopeAsync(async services =>
		{
			var db = services.GetRequiredService<AppDbContext>();
			await db.Database.ExecuteSqlInterpolatedAsync($"""
				UPDATE config_value_revisions
				SET "ModifiedBy" = {"user:https://localhost:missing-user"}
				WHERE "ConfigItemId" = {configItemId} AND "Revision" = {1L}
				""");
		});

		var history = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value/revisions?environment=production");
		history.EnsureSuccessStatusCode();

		using (var historyPayload = JsonDocument.Parse(await history.Content.ReadAsStringAsync()))
		{
			var revision = historyPayload.RootElement.EnumerateArray().Single();
			Assert.Equal("Unknown user", revision.GetProperty("createdByDisplayName").GetString());
		}

		var revisionDetail = await client.GetAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value/revisions/1?environment=production");
		revisionDetail.EnsureSuccessStatusCode();

		using var payload = JsonDocument.Parse(await revisionDetail.Content.ReadAsStringAsync());
		Assert.Equal("Unknown user", payload.RootElement.GetProperty("createdByDisplayName").GetString());
	}

	[Fact]
	public async Task SetValue_ShouldReturnConflict_ForStaleExpectedRevision()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("revision-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var firstSet = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v1", expectedRevision = 0 });
		firstSet.EnsureSuccessStatusCode();

		var stale = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v2", expectedRevision = 0 });

		Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
	}

	[Fact]
	public async Task DeleteConfigItem_ShouldPreserveRevisionHistory()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("revision-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var firstSet = await client.PutAsJsonAsync(
			$"/projects/{projectId}/secrets/{configItemId}/value?environment=production",
			new { value = "secret-v1", expectedRevision = 0 });
		firstSet.EnsureSuccessStatusCode();

		var delete = await client.DeleteAsync($"/projects/{projectId}/secrets/{configItemId}");
		delete.EnsureSuccessStatusCode();

		await host.WithScopeAsync(async services =>
		{
			var db = services.GetRequiredService<AppDbContext>();

			Assert.False(await db.ConfigValues.AnyAsync(v => v.ConfigItemId == configItemId));
			Assert.True(await db.ConfigValueRevisions.AnyAsync(r => r.ProjectId == projectId && r.ConfigItemId == configItemId));
		});
	}

	private static async Task<Guid> CreateProjectAsync(HttpClient client)
	{
		var create = await client.PostAsJsonAsync(
			"/projects",
			new { name = "Revision Endpoint Project" });
		create.EnsureSuccessStatusCode();

		using var payload = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
		return payload.RootElement.GetProperty("id").GetGuid();
	}

	private static async Task<Guid> CreateConfigItemAsync(
		HttpClient client,
		TestHost host,
		Guid projectId,
		string key)
	{
		var create = await client.PostAsJsonAsync(
			$"/projects/{projectId}/secrets",
			new { key });
		create.EnsureSuccessStatusCode();

		return await host.WithScopeAsync(async services =>
		{
			var db = services.GetRequiredService<AppDbContext>();
			var configItems = await db.ConfigItems
				.Where(configItem => configItem.ProjectId == projectId)
				.ToListAsync();

			return configItems
				.Where(configItem => configItem.Key.Value == key)
				.Select(configItem => configItem.Id)
				.Single();
		});
	}
}
