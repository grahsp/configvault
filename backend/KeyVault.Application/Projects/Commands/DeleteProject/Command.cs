using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Commands.DeleteProject;

public record Command(Guid Id) : ICommand<Unit>;