using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Projects.Commands.AddMember;

public sealed record Command(Guid ProjectId, ActorId UserId) : ICommand<Unit>;