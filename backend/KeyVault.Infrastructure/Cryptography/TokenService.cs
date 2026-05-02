using System.Security.Cryptography;
using System.Text;
using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Domain.Invitations;
using Microsoft.AspNetCore.WebUtilities;

namespace KeyVault.Infrastructure.Cryptography;

public class TokenService : ITokenService
{
	public string GenerateToken(string? prefix)
	{
		var bytes = RandomNumberGenerator.GetBytes(32);
		var token = Base64UrlTextEncoder.Encode(bytes);

		return prefix is null ? token : $"{prefix}_{token}";
	}

	public InvitationTokenHash HashToken(string token)
	{
		var normalized = token.Contains('_')
			? token[(token.IndexOf('_') + 1)..]
			: token;

		var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
		var hash = Convert.ToHexString(bytes);	
	
		return InvitationTokenHash.Create(hash);
	}
}