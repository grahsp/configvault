using KeyVault.Application.Actors;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public sealed class ConfigItemOperationAuthorizer : IConfigItemOperationAuthorizer
{
	public void Authorize(IActorContext actor, Project project, OperationBatch batch)
	{
		if (actor is not UserActorContext user)
			throw new ForbiddenException();
		
		var member = project.RequireMember(user.Id);
		
		foreach (var operation in batch.Operations)
		{
			switch (operation)
			{
				case DeleteItem:
				case RenameItem:
					project.RequireRole(member, ProjectRole.Admin);
					break;

				case SetValue:
				case CreateItem:
					project.RequireRole(member, ProjectRole.Member);
					break;
			}
		}
	}
}