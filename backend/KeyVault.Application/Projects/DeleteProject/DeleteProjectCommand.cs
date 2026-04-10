using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.DeleteProject;

public record DeleteProjectCommand(Guid Id) : ICommand<Unit>;