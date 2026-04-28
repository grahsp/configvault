using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Application.Authorization.Actions;

public interface IProjectAction
{
	ProjectCapability RequiredCapability { get; }
}