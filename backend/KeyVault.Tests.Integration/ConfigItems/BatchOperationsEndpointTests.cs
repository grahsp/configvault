using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using KeyVault.Infrastructure.Persistence;
using KeyVault.Tests.Integration.Fixtures;
using KeyVault.Tests.Integration.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.ConfigItems;

public sealed class BatchOperationsEndpointTests(TestFixture fixture) : IClassFixture<TestFixture>
{
	[Fact]
	public async Task PostOperations_ShouldReturnNoContent_ForValidMixedRequest()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var response = await client.PostAsJsonAsync(
			$"/projects/{projectId}/secrets/operations",
			new
			{
				environment = "production",
				operations = new object[]
				{
					new { type = "create", key = "NEW_SECRET", initialValue = "initial-secret" },
					new { type = "rename", secretId = configItemId, key = "PUBLIC_KEY" },
					new { type = "set-value", secretId = configItemId, value = "updated-secret", expectedRevision = 0 },
				},
			});

		Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
	}

	[Fact]
	public async Task PostOperations_ShouldAcceptFrontendSecretIdPayload()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);
		var configItemId = await CreateConfigItemAsync(client, host, projectId, "API_KEY");

		var response = await client.PostAsJsonAsync(
			$"/projects/{projectId}/secrets/operations",
			new
			{
				environment = "production",
				operations = new object[]
				{
					new { type = "rename", secretId = configItemId, key = "PUBLIC_KEY" },
					new { type = "set-value", secretId = configItemId, value = "updated-secret", expectedRevision = 0 },
				},
			});

		Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
	}

	[Fact]
	public async Task PostOperations_ShouldReturnBadRequest_ForUnknownOperationType()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);

		var response = await client.PostAsync(
			$"/projects/{projectId}/secrets/operations",
			CreateJsonContent(
				"""
				{
				  "environment": "production",
				  "operations": [
				    { "type": "rotate", "configItemId": "00000000-0000-0000-0000-000000000001" }
				  ]
				}
				"""));

		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}

	[Fact]
	public async Task PostOperations_ShouldReturnBadRequest_WhenTypeDiscriminatorIsMissing()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);

		var response = await client.PostAsync(
			$"/projects/{projectId}/secrets/operations",
			CreateJsonContent(
				"""
				{
				  "environment": "production",
				  "operations": [
				    { "configItemId": "00000000-0000-0000-0000-000000000001", "value": "secret" }
				  ]
				}
				"""));

		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
		var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
		Assert.NotNull(problem);
		Assert.Equal(400, problem.Status);
		Assert.Equal("Validation failed", problem.Title);
		Assert.Contains("type", problem.Detail, StringComparison.OrdinalIgnoreCase);
	}

	[Fact]
	public async Task PostOperations_ShouldReturnBadRequest_WhenCreateKeyHasWrongJsonShape()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);

		var response = await client.PostAsync(
			$"/projects/{projectId}/secrets/operations",
			CreateJsonContent(
				"""
				{
				  "environment": "production",
				  "operations": [
				    { "type": "create", "key": { "value": "API_KEY" } }
				  ]
				}
				"""));

		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}

	[Fact]
	public async Task PostOperations_ShouldReturnBadRequest_ForInvalidCreateKey()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);

		var response = await client.PostAsJsonAsync(
			$"/projects/{projectId}/secrets/operations",
			new
			{
				environment = "production",
				operations = new object[]
				{
					new { type = "create", key = "not valid" },
				},
			});

		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
		var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
		Assert.NotNull(problem);
		Assert.Equal(400, problem.Status);
		Assert.Equal("Validation failed", problem.Title);
		Assert.Equal("Invalid key format", problem.Detail);
	}

	[Fact]
	public async Task PostImport_ShouldReturnOk_ForValidPlainTextEnvContent()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);
		var client = host.CreateJsonClient("batch-owner");
		var projectId = await CreateProjectAsync(client);

		var response = await client.PostAsync(
			$"/projects/{projectId}/import?environment=production",
			new StringContent(
				"""
				API_KEY=secret-value
				DATABASE_URL=postgres://localhost/app
				""",
				Encoding.UTF8,
				"text/plain"));

		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		await host.WithScopeAsync(async services =>
		{
			var db = services.GetRequiredService<AppDbContext>();
			var configItems = (await db.ConfigItems
				.Where(configItem => configItem.ProjectId == projectId)
				.ToListAsync())
				.OrderBy(configItem => configItem.Key.Value)
				.ToList();

			Assert.Collection(
				configItems,
				configItem => Assert.Equal("API_KEY", configItem.Key.Value),
				configItem => Assert.Equal("DATABASE_URL", configItem.Key.Value));
		});
	}

	private static StringContent CreateJsonContent(string json)
		=> new(json, Encoding.UTF8, "application/json");

	private static async Task<Guid> CreateProjectAsync(HttpClient client)
	{
		var create = await client.PostAsJsonAsync(
			"/projects",
			new { name = "Batch Endpoint Project" });
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
			return configItems.Single(configItem => configItem.Key.Value == key).Id;
		});
	}

}
