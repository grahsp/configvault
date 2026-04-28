using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Users;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.Users;

public sealed class UserProvisionerTests
{
	[Fact]
	public async Task GetOrProvisionUserAsync_ShouldReturnExistingUser_WhenUserDoesExist()
	{
		var sut = new Sut();
		var existing = sut.GivenExistingUser();
		
		var result = await sut.GetOrProvisionUserAsync();

		Assert.Equal(existing, result);
		Assert.Null(sut.Users.AddedUser);
		Assert.False(sut.Uow.SaveChangesCalled);
	}

	[Fact]
	public async Task GetOrProvisionUserAsync_ShouldCreateAndSaveUser_WhenUserDoesNotExist()
	{
		var sut = new Sut();
		var now = sut.Time.GetUtcNow();

		var result = await sut.GetOrProvisionUserAsync();

		Assert.NotNull(sut.Users.AddedUser);
		var addedUser = sut.Users.AddedUser!;
		Assert.Equal(new ResolvedUser(addedUser.Id), result);
		Assert.Equal(now, addedUser.CreatedAt);
		Assert.Equal("Ada", addedUser.DisplayName);
		Assert.Equal("ada@example.com", addedUser.Email);
		Assert.True(sut.Uow.SaveChangesCalled);
		
		var login = Assert.Single(addedUser.ExternalLogins);
		Assert.Equal(sut.Issuer, login.Issuer);
		Assert.Equal(sut.Subject, login.Subject);
	}

	[Theory]
	[InlineData(null, "auth0|abc-123", "user-abc-12")]
	[InlineData(null, "plain-subject", "user-plain-")]
	[InlineData("Nick", "auth0|abc-123", "Nick")]
	public async Task GetOrProvisionUserAsync_ShouldSeedDisplayName(
		string? nickname,
		string subject,
		string expectedDisplayName)
	{
		var sut = new Sut();
		var identity = sut.CreateIdentity(subject: subject, nickname: nickname);

		await sut.GetOrProvisionUserAsync(identity);

		Assert.NotNull(sut.Users.AddedUser);
		Assert.Equal(expectedDisplayName, sut.Users.AddedUser!.DisplayName);
	}

	[Fact]
	public async Task GetOrProvisionUserAsync_ShouldUpdateExistingUserEmailWithoutOverwritingDisplayName()
	{
		var sut = new Sut();
		var existingUser = User.Create(sut.Issuer, sut.Subject, "Local Name", null, sut.Time.GetUtcNow());
		sut.Users.SetExistingUser(existingUser);
		sut.GivenExistingUser(new ResolvedUser(existingUser.Id));

		await sut.GetOrProvisionUserAsync(sut.CreateIdentity(nickname: "Token Nick", email: "user@example.com"));

		Assert.Equal("Local Name", existingUser.DisplayName);
		Assert.Equal("user@example.com", existingUser.Email);
		Assert.True(sut.Uow.SaveChangesCalled);
		Assert.Null(sut.Users.AddedUser);
	}

	private sealed class Sut
	{
		public FakeUserIdentityResolver Resolver { get; }
		public FakeUserRepository Users { get; }
		public FakeUnitOfWork Uow { get; }
		public FakeTimeProvider Time { get; }
		public UserProvisioner Service { get; }
		
		public string Issuer => "issuer";
		public string Subject => "auth0|abc-123";
		public string? Nickname => "Ada";
		public string? Email => "ada@example.com";
		
		private readonly ExternalIdentity _context;

		public Sut()
		{
			Resolver = new FakeUserIdentityResolver();
			Users = new FakeUserRepository();
			Uow = new FakeUnitOfWork();
			Time = new FakeTimeProvider();
			
			Service = new UserProvisioner(Resolver, Users, Uow, Time);

			_context = CreateIdentity();
		}
		
		public Task<ResolvedUser> GetOrProvisionUserAsync(ExternalIdentity? context = null, CancellationToken ct = default)
			=> Service.GetOrProvisionUserAsync(context ?? _context, ct);

		public ExternalIdentity CreateIdentity(
			string issuer = "issuer",
			string subject = "auth0|abc-123",
			string? nickname = "Ada",
			string? email = "ada@example.com")
			=> new(issuer, subject, nickname, email);

		public ResolvedUser GivenExistingUser(ResolvedUser? existingUser = null)
		{
			var user = existingUser ?? new ResolvedUser(UserId.New());
			Resolver.SetUserToReturn(user);
			
			return user;
		}
	}

	private sealed class FakeUserIdentityResolver : IUserIdentityResolver
	{
		private ResolvedUser? UserToReturn { get; set; }

		public void SetUserToReturn(ResolvedUser user) => UserToReturn = user;

		public Task<ResolvedUser?> GetUserAsync(ExternalIdentity identity, CancellationToken ct)
			=> Task.FromResult(UserToReturn);
	}

	private sealed class FakeUserRepository : IUserRepository
	{
		public User? AddedUser { get; private set; }
		private User? ExistingUser { get; set; }

		public void SetExistingUser(User user) => ExistingUser = user;

		public void Add(User user) => AddedUser = user;
		public void Remove(User user) => throw new NotImplementedException();
		public Task<User?> GetByIdAsync(UserId id, CancellationToken ct)
			=> Task.FromResult(ExistingUser is not null && ExistingUser.Id == id ? ExistingUser : null);
	}

	private sealed class FakeUnitOfWork : IUnitOfWork
	{
		public bool SaveChangesCalled { get; private set; }

		public Task<int> SaveChangesAsync(CancellationToken ct = default)
		{
			SaveChangesCalled = true;
			return Task.FromResult(1);
		}
	}
}
