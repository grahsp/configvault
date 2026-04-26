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
		=> new ActorId(value);
	
	public override string ToString() => Value;
}