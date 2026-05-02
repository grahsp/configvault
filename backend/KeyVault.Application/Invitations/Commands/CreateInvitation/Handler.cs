using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Invitations;
using Microsoft.Extensions.Options;

namespace KeyVault.Application.Invitations.Commands.CreateInvitation;

public class Handler(
	IActorContext context,
	IProjectAuthorizationService authorization,
	IProjectRepository projects,
	IProjectInvitationRepository invitations,
	ITokenService tokens,
	IOptions<ProjectInvitationOptions> options,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, string>
{
	public async Task<string> HandleAsync(Command command, CancellationToken ct)
	{
		var userId = context.RequireUserId();
		
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(command.ProjectId);
		
		await authorization.EnsureCanAccessAsync(ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Write), project, ct);
		
		var token = tokens.GenerateToken();
		var hash = tokens.HashToken(token);

		var invitation = ProjectInvitation.Create(
			project.Id,
			hash,
			userId,
			time.GetUtcNow(),
			options.Value.Lifetime);

		invitations.Add(invitation);
		await uow.SaveChangesAsync(ct);
		
		return token;
	}
}