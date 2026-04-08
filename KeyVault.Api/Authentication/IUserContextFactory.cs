using System.Security.Claims;
using KeyVault.Application.Authentication;

namespace KeyVault.Api.Authentication;

public interface IUserContextFactory
{
	ExternalIdentity Create(ClaimsPrincipal principal);
}