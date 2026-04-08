using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users;
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
		Assert.Equal(new AuthenticatedUser(addedUser.Id, addedUser.Status), result);
		Assert.Equal(now, addedUser.CreatedAt);
		Assert.True(sut.Uow.SaveChangesCalled);
		
		var login = Assert.Single(addedUser.ExternalLogins);
		Assert.Equal(sut.Issuer, login.Issuer);
		Assert.Equal(sut.Subject, login.Subject);
	}

	private sealed class Sut
	{
		public FakeUserIdentityResolver Resolver { get; }
		public FakeUserRepository Users { get; }
		public FakeUnitOfWork Uow { get; }
		public FakeTimeProvider Time { get; }
		public UserProvisioner Service { get; }
		
		public string Issuer => "issuer";
		public string Subject => "subject";
		
		private readonly ExternalIdentity _context;

		public Sut()
		{
			Resolver = new FakeUserIdentityResolver();
			Users = new FakeUserRepository();
			Uow = new FakeUnitOfWork();
			Time = new FakeTimeProvider();
			
			Service = new UserProvisioner(Resolver, Users, Uow, Time);

			_context = new ExternalIdentity(Issuer, Subject);
		}
		
		public Task<AuthenticatedUser> GetOrProvisionUserAsync(ExternalIdentity? context = null, CancellationToken ct = default)
			=> Service.GetOrProvisionUserAsync(context ?? _context, ct);

		public AuthenticatedUser GivenExistingUser(AuthenticatedUser? existingUser = null)
		{
			var user = existingUser ?? new AuthenticatedUser(Guid.NewGuid(), UserStatus.Active);
			Resolver.SetUserToReturn(user);
			
			return user;
		}
	}

	private sealed class FakeUserIdentityResolver : IUserIdentityResolver
	{
		private AuthenticatedUser? UserToReturn { get; set; }

		public void SetUserToReturn(AuthenticatedUser user) => UserToReturn = user;

		public Task<AuthenticatedUser?> GetUserAsync(string issuer, string subject, CancellationToken ct)
			=> Task.FromResult(UserToReturn);
	}

	private sealed class FakeUserRepository : IUserRepository
	{
		public User? AddedUser { get; private set; }

		public void Add(User user) => AddedUser = user;
		public void Remove(User user) => throw new NotImplementedException();
		public Task<User?> GetByIdAsync(Guid id, CancellationToken ct) => throw new NotImplementedException();
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