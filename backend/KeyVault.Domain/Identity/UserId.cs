using System.Diagnostics.CodeAnalysis;

namespace KeyVault.Domain.Identity;

public sealed record UserId
{
	public Guid Value { get; }

	private UserId(Guid value)
	{
		Value = value;
	}

	public static UserId New() => new(Guid.NewGuid());

	public static UserId Create(Guid value) => new(value);

	public static UserId Parse(string value)
	{
		if (!TryParse(value, out var userId))
			throw new FormatException($"Invalid UserId: '{value}'");

		return userId;
	}

	public static bool TryParse(string? value, [NotNullWhen(true)] out UserId? userId)
	{
		userId = null;

		if (!Guid.TryParseExact(value, "N", out var guid))
			return false;

		userId = new UserId(guid);
		return true;
	}

	public override string ToString() => Value.ToString("N");
}
