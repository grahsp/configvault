using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Invitations;

public class InvitationException(string message) : DomainException(message);

public class InvitationAlreadyAcceptedException() : InvitationException("Invitation already accepted.");
public class InvitationExpiredException() : InvitationException("Invitation has expired.");
public class InvitationRevokedException() : InvitationException("Invitation has been revoked.");

public class InvitationAlreadyHandledException(Exception? inner = null)
	: InvitationException("Invitation has already been handled.")
{
	public Exception? Inner { get; } = inner;
}