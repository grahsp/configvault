using System.Security.Claims;
using KeyVault.Api.Authentication;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Domain;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Invitations;
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
		var factory = CreateSut(new Claim("scope", "secret:read secret:write"));
		var context = factory.Create();
		var project = Project.Create(UserId.New(), "project", TestEncryptedValue(1), DateTimeOffset.UtcNow);
		var sut = new ActorResolver(new FakeReadDbContext(), new RoleCapabilities(), new ScopeCapabilities());

		var actor = await sut.ResolveAsync(context, project.Id, CancellationToken.None);

		Assert.True(actor.Has(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read)));
		Assert.False(actor.Has(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write)));
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

	private sealed class FakeReadDbContext : IReadDbContext
	{
		public IQueryable<KeyVault.Domain.Users.User> Users => Enumerable.Empty<KeyVault.Domain.Users.User>().AsQueryable();
		public IQueryable<Project> Projects => Enumerable.Empty<Project>().AsQueryable();
		public IQueryable<ProjectDataKey> DataKeys => Enumerable.Empty<ProjectDataKey>().AsQueryable();
		public IQueryable<KeyVault.Domain.Projects.Environment> Environments
			=> Enumerable.Empty<KeyVault.Domain.Projects.Environment>().AsQueryable();
		public IQueryable<KeyVault.Domain.ConfigItems.ConfigItem> ConfigItems
			=> Enumerable.Empty<KeyVault.Domain.ConfigItems.ConfigItem>().AsQueryable();
		public IQueryable<KeyVault.Domain.ConfigItems.ConfigValue> ConfigValues
			=> Enumerable.Empty<KeyVault.Domain.ConfigItems.ConfigValue>().AsQueryable();
		public IQueryable<ProjectMember> ProjectMembers => Enumerable.Empty<ProjectMember>().AsQueryable();
		public IQueryable<ProjectInvitation> Invitations => Enumerable.Empty<ProjectInvitation>().AsQueryable();
	}
}
