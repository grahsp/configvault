namespace KeyVault.Domain.Invitations;

public readonly record struct InvitationTokenHash
{
	public string Value { get; }

	private InvitationTokenHash(string value)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(value);
		Value = value;
	}

	public static InvitationTokenHash Create(string value)
		=> new InvitationTokenHash(value);

	public override string ToString() => Value;
}