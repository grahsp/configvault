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

		Assert.Same(existing, result);
		Assert.Null(sut.Users.AddedUser);
		Assert.False(sut.Uow.SaveChangesCalled);
	}

	[Fact]
	public async Task GetOrProvisionUserAsync_ShouldCreateAndSaveUser_WhenUserDoesNotExist()
	{
		var sut = new Sut();
		var now = sut.Time.GetUtcNow();

		var result = await sut.GetOrProvisionUserAsync();

		Assert.Equal(sut.Users.AddedUser, result);
		Assert.Equal(now, result.CreatedAt);
		Assert.True(sut.Uow.SaveChangesCalled);
		
		var login = Assert.Single(result.ExternalLogins);
		Assert.Equal(sut.Issuer, login.Issuer);
		Assert.Equal(sut.Subject, login.Subject);
	}

	private sealed class Sut
	{
		public FakeUserRepository Users { get; }
		public FakeUnitOfWork Uow { get; }
		public FakeTimeProvider Time { get; }
		
		public UserProvisioner Service { get; }

		
		public string Issuer => "issuer";
		public string Subject => "subject";
		
		private readonly UserContext _context;

		public Sut()
		{
			Users = new FakeUserRepository();
			Uow = new FakeUnitOfWork();
			Time = new FakeTimeProvider();
			
			Service = new UserProvisioner(Users, Uow, Time);

			_context = new UserContext(Issuer, Subject, "email", "name");
		}
		
		public Task<User> GetOrProvisionUserAsync(UserContext? context = null, CancellationToken ct = default)
			=> Service.GetOrProvisionUserAsync(context ?? _context, ct);

		public User GivenExistingUser(User? existingUser = null)
		{
			var user = existingUser ?? User.Create(_context.Email, _context.Name, Time.GetUtcNow());
			Users.SetUserToReturn(user);
			
			return user;
		}
	}

	private sealed class FakeUserRepository : IUserRepository
	{
		public User? AddedUser { get; private set; }
		private User? UserToReturn { get; set; }
		
		public void SetUserToReturn(User user) => UserToReturn = user;

		public Task<User?> GetByExternalIdentityAsync(string issuer, string subject, CancellationToken ct)
		{
			return Task.FromResult(UserToReturn);
		}

		public void Add(User user)
		{
			AddedUser = user;
		}

		public void Remove(User user) => throw new NotImplementedException();
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