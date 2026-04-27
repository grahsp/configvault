using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Projects.Commands.RemoveMember;

public sealed record Command(Guid ProjectId, ActorId TargetActorId) : ICommand<Unit>;