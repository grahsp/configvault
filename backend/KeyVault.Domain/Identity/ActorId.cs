using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

namespace KeyVault.Domain.Identity;

public sealed record ActorId
{
	private static readonly Regex Pattern = new("^(user|machine):.+:.+$", RegexOptions.Compiled);

	public string Value { get; }
		
	private ActorId(string value)
	{
		Value = value;
	}
	
	public static ActorId User(string issuer, string subject)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(issuer);
		ArgumentException.ThrowIfNullOrWhiteSpace(subject);

		return new ActorId($"user:{issuer}:{subject}");
	}

	public static ActorId Machine(string issuer, string clientId)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(issuer);
		ArgumentException.ThrowIfNullOrWhiteSpace(clientId);

		return new ActorId($"machine:{issuer}:{clientId}");
	}

	public static ActorId Parse(string value)
	{
		if (!TryParse(value, out var actorId))
			throw new FormatException($"Invalid ActorId: '{value}'");

		return actorId;
	}

	public static bool TryParse(string? value, [NotNullWhen(true)] out ActorId? actorId)
	{
		actorId = null;

		if (string.IsNullOrWhiteSpace(value) || !Pattern.IsMatch(value))
			return false;

		actorId = new ActorId(value);
		return true;
	}
	
	public override string ToString() => Value;
}
