using System.Diagnostics.CodeAnalysis;

namespace KeyVault.Domain.Actors;

public sealed record ActorId
{
	public string Value { get; }
		
	private ActorId(string value)
	{
		Value = value;
	}
	
	public static ActorId User(Guid id)
		=> new ActorId(id.ToString("N"));

	public static ActorId Parse(string value)
	{
		if (!TryParse(value, out var actorId))
			throw new FormatException($"Invalid ActorId: '{value}'");

		return actorId;
	}

	public static bool TryParse(string? value, [NotNullWhen(true)] out ActorId? actorId)
	{
		actorId = null;

		if (string.IsNullOrWhiteSpace(value))
			return false;

		if (!Guid.TryParseExact(value, "N", out _))
			return false;

		actorId = new ActorId(value);
		return true;
	}
	
	public override string ToString() => Value;
}