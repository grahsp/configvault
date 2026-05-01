using System.Diagnostics.CodeAnalysis;

namespace KeyVault.Domain.Identity;

public readonly record struct UserId
{
	public Guid Value { get; }

	private UserId(Guid value)
	{
		Value = value;
	}

	public static UserId New() => new UserId(Guid.NewGuid());

	public static UserId Create(Guid value)
	{
		if (value == Guid.Empty)
			throw new ArgumentException("UserId cannot be empty", nameof(value));
		
		return new UserId(value);
	}

	public static UserId Parse(string value)
	{
		if (!TryParse(value, out var userId))
			throw new FormatException($"Invalid UserId: '{value}'");

		return userId;
	}

	public static bool TryParse(string? value, [NotNullWhen(true)] out UserId userId)
	{
		userId = default;

		if (!Guid.TryParseExact(value, "N", out var guid))
			return false;

		if (guid == Guid.Empty)
			return false;

		userId = new UserId(guid);
		return true;
	}

	public override string ToString() => Value.ToString("N");
}
