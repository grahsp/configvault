using System.Security.Claims;
using KeyVault.Api.Authentication;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;
using KeyVault.Infrastructure.Authentication;
using Microsoft.AspNetCore.Http;

namespace KeyVault.Tests.Unit.Authentication;

public sealed class ActorContextFactoryTests
{
	[Fact]
	public void Create_ShouldSplitSpaceDelimitedMachineScopeClaim()
	{
		var sut = CreateSut(
			new Claim("scope", "config:read config:write"),
			new Claim("scope", " project:delete "));

		var actor = Assert.IsType<MachineActorContext>(sut.Create());

		Assert.Equal(["config:read", "config:write", "project:delete"], actor.Scopes);
	}

	[Fact]
	public void Create_ShouldKeepMultipleMachineScopeClaims()
	{
		var sut = CreateSut(
			new Claim("scope", "config:read"),
			new Claim("scope", "config:write"));

		var actor = Assert.IsType<MachineActorContext>(sut.Create());

		Assert.Equal(["config:read", "config:write"], actor.Scopes);
	}

	[Fact]
	public void Create_ShouldReturnEmptyScopes_WhenMachineHasNoScopeClaims()
	{
		var sut = CreateSut();

		var actor = Assert.IsType<MachineActorContext>(sut.Create());

		Assert.Empty(actor.Scopes);
	}

	[Fact]
	public async Task ResolveAsync_ShouldMapCapabilities_FromSplitMachineScopes()
	{
		var factory = CreateSut(new Claim("scope", "config:read config:write"));
		var context = factory.Create();
		var project = Project.Create(UserId.New(), "project", TestEncryptedValue(1), DateTimeOffset.UtcNow);
		var sut = new ActorResolver(new RoleCapabilities(), new ScopeCapabilities());

		var actor = await sut.ResolveAsync(context, project, CancellationToken.None);

		Assert.True(actor.Has(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read)));
		Assert.True(actor.Has(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write)));
	}

	private static ActorContextFactory CreateSut(params Claim[] scopeClaims)
	{
		var context = new DefaultHttpContext();
		context.User = new ClaimsPrincipal(
			new ClaimsIdentity(
				[
					new Claim("gty", "client-credentials"),
					new Claim("iss", "https://issuer.example"),
					new Claim(ClaimTypes.NameIdentifier, "client-123"),
					.. scopeClaims
				],
				"test"));

		return new ActorContextFactory(new HttpContextAccessor { HttpContext = context });
	}

	private static EncryptedValue TestEncryptedValue(byte seed)
		=> EncryptedValue.Create(
			1,
			Enumerable.Range(0, 12).Select(offset => (byte)(seed + offset)).ToArray(),
			[(byte)(seed + 20)],
			Enumerable.Range(0, 16).Select(offset => (byte)(seed + 40 + offset)).ToArray());
}
