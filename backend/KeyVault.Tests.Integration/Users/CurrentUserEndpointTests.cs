using System.Net.Http.Json;
using System.Net;
using KeyVault.Tests.Integration.Fixtures;
using KeyVault.Tests.Integration.Hosting;

namespace KeyVault.Tests.Integration.Users;

public sealed class CurrentUserEndpointTests(TestFixture fixture) : IClassFixture<TestFixture>
{
	[Fact]
	public async Task GetMe_ShouldProvisionActiveUser_OnFirstRequest()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);

		var client = host.CreateJsonClient("auth0|first-login-user");
		client.DefaultRequestHeaders.Add("X-Dev-Nickname", "Ada");
		client.DefaultRequestHeaders.Add("X-Dev-Email", "ada@example.com");

		var response = await client.GetFromJsonAsync<CurrentUserResponse>("/me");

		Assert.NotNull(response);
		Assert.Equal("Ada", response.DisplayName);
		Assert.Equal("ada@example.com", response.Email);
	}

	[Fact]
	public async Task GetMe_ShouldRejectMachinePrincipal()
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);

		var client = host.CreateMachineClient();

		var response = await client.GetAsync("/me");

		Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
	}

	[Theory]
	[InlineData("auth0|abc-123", null, "user-abc-12")]
	[InlineData("plain-subject", null, "user-plain-")]
	[InlineData("auth0|abc-123", "Nick", "Nick")]
	public async Task GetMe_ShouldSeedDisplayName(
		string subject,
		string? nickname,
		string expectedDisplayName)
	{
		await using var host = fixture.CreateDefaultHost();
		await TestFixture.ResetAsync(host);

		var client = host.CreateJsonClient(subject);
		if (nickname is not null)
			client.DefaultRequestHeaders.Add("X-Dev-Nickname", nickname);

		var response = await client.GetFromJsonAsync<CurrentUserResponse>("/me");

		Assert.NotNull(response);
		Assert.Equal(expectedDisplayName, response.DisplayName);
	}

	private sealed record CurrentUserResponse(
		string Id,
		string? Email,
		string? DisplayName,
		DateTimeOffset CreatedAt);
}
