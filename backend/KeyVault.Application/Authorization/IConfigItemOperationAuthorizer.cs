using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public interface IConfigItemOperationAuthorizer
{
	void Authorize(IActorContext actor, Project project, OperationBatch batch);
}