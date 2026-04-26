namespace KeyVault.Application.Authentication;

public sealed record ActorId
{
	public ActorType Type { get; }
	public string Value { get; }
		
	private ActorId(ActorType type, string value)
	{
		Type = type;
		Value = value;
	}
	
	public static ActorId User(Guid id)
		=> new ActorId(ActorType.User, id.ToString("N"));
	
	public override string ToString() => $"{Type}:{Value}";
}