using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using KeyVault.Infrastructure.Persistence;
using KeyVault.Tests.Integration.Fixtures;
using KeyVault.Tests.Integration.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.Invitations;

public sealed class AcceptInvitationEndpointTests(TestFixture fixture) : IClassFixture<TestFixture>
{
	[Fact]
	public async Task GetAccept_ShouldAddCurrentUserToProject_AndReturnProjectId()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);

		var ownerClient = host.CreateJsonClient("auth0|project-owner");
		var projectId = await CreateProjectAsync(ownerClient);
		var token = await CreateInvitationAsync(ownerClient, projectId);

		var invitedClient = host.CreateJsonClient("auth0|invited-user");
		var response = await invitedClient.GetAsync($"/invitations/accept/{token}");

		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
		Assert.Equal(projectId, payload.RootElement.GetProperty("projectId").GetGuid());

		await host.WithScopeAsync(async services =>
		{
			var db = services.GetRequiredService<AppDbContext>();
			var project = await db.Projects
				.Include(item => item.Members)
				.SingleAsync(item => item.Id == projectId);

			Assert.Contains(project.Members, member => member.Role.ToString() == "Member");
			Assert.Equal(2, project.Members.Count);
		});
	}

	[Fact]
	public async Task GetAccept_ShouldReturnNotFound_ForInvalidToken()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);

		var client = host.CreateJsonClient("auth0|invited-user");
		var response = await client.GetAsync("/invitations/accept/not-a-real-token");

		Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

		var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
		Assert.NotNull(problem);
		Assert.Equal(404, problem.Status);
		Assert.Equal("Resource not found", problem.Title);
	}

	[Fact]
	public async Task GetAccept_ShouldReturnNotFound_WhenInvitationWasAlreadyUsed()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);

		var ownerClient = host.CreateJsonClient("auth0|project-owner");
		var projectId = await CreateProjectAsync(ownerClient);
		var token = await CreateInvitationAsync(ownerClient, projectId);

		var firstClient = host.CreateJsonClient("auth0|first-user");
		var secondClient = host.CreateJsonClient("auth0|second-user");

		var firstResponse = await firstClient.GetAsync($"/invitations/accept/{token}");
		Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);

		var secondResponse = await secondClient.GetAsync($"/invitations/accept/{token}");
		Assert.Equal(HttpStatusCode.NotFound, secondResponse.StatusCode);

		var problem = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
		Assert.NotNull(problem);
		Assert.Equal(404, problem.Status);
		Assert.Equal("Invitation not found", problem.Title);
	}

	private static async Task<Guid> CreateProjectAsync(HttpClient client)
	{
		var create = await client.PostAsJsonAsync(
			"/projects",
			new { name = "Invitation Acceptance Project" });
		create.EnsureSuccessStatusCode();

		using var payload = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
		return payload.RootElement.GetProperty("id").GetGuid();
	}

	private static async Task<string> CreateInvitationAsync(HttpClient client, Guid projectId)
	{
		var response = await client.PostAsync($"/projects/{projectId}/invitations", null);
		response.EnsureSuccessStatusCode();

		using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
		return payload.RootElement.GetProperty("token").GetString()
			?? throw new InvalidOperationException("Invitation token was missing from the response.");
	}
}
