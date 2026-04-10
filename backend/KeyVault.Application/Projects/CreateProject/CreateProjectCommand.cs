using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.CreateProject;

public sealed record CreateProjectCommand(string Name) : ICommand<Guid>;