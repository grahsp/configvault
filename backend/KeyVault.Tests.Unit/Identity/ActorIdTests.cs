using KeyVault.Domain.Identity;

namespace KeyVault.Tests.Unit.Identity;

public sealed class ActorIdTests
{
	[Fact]
	public void User_ShouldFormatExternalIdentity()
	{
		var actorId = ActorId.User("https://issuer.example", "subject-123");

		Assert.Equal("user:https://issuer.example:subject-123", actorId.Value);
	}

	[Fact]
	public void Machine_ShouldFormatExternalIdentity()
	{
		var actorId = ActorId.Machine("https://issuer.example", "client-123");

		Assert.Equal("machine:https://issuer.example:client-123", actorId.Value);
	}

	[Theory]
	[InlineData("user:https://issuer.example:subject-123")]
	[InlineData("machine:https://issuer.example:client-123")]
	public void Parse_ShouldAcceptValidActorIds(string value)
	{
		var actorId = ActorId.Parse(value);

		Assert.Equal(value, actorId.Value);
	}

	[Theory]
	[InlineData("")]
	[InlineData("not-an-actor-id")]
	[InlineData("machine:client-123")]
	[InlineData("user::subject-123")]
	[InlineData("machine::client-123")]
	public void TryParse_ShouldRejectInvalidActorIds(string value)
	{
		var result = ActorId.TryParse(value, out var actorId);

		Assert.False(result);
		Assert.Null(actorId);
	}
}
