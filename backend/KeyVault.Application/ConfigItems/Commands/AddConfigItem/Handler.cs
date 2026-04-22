using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Commands.AddConfigItem;

public sealed class Handler(
	IUserContext user,
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(command.ProjectId);

		project.RequireMemberWithRole(user.UserId, ProjectRole.Admin);
		
		if (await configurations.ExistsAsync(command.ProjectId, command.Key, ct))
			throw new ConfigItemAlreadyExistsException(command.Key);
		
		var item = ConfigItem.Create(project.Id, command.Key, time.GetUtcNow());
			
		configurations.Add(item);

		try
		{
			await uow.SaveChangesAsync(ct);
		}
		catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
		{
			throw new ConfigItemAlreadyExistsException(command.Key);
		}
		
		return Unit.Value;
	}

	private static bool IsUniqueConstraintViolation(DbUpdateException ex)
		=> ex.InnerException?.GetType().FullName == "Npgsql.PostgresException" &&
		   ex.InnerException.GetType().GetProperty("SqlState")?.GetValue(ex.InnerException)?.ToString() == "23505";
}
