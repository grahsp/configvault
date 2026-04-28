namespace KeyVault.Application.Authorization.Actions;

public interface IProjectAction
{
	ProjectCapability RequiredCapability { get; }
}