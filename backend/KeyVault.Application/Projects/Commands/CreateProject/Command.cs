using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Commands.CreateProject;

public sealed record Command(string Name) : ICommand<Guid>;