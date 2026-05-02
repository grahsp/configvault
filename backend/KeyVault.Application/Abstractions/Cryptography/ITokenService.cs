using KeyVault.Domain.Invitations;

namespace KeyVault.Application.Abstractions.Cryptography;

public interface ITokenService
{
	string GenerateToken(string? prefix = null);
	InvitationTokenHash HashToken(string token);
}