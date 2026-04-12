using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries.GetEnvironments;

namespace KeyVault.Application.Projects.Commands.AddEnvironment;

public sealed record Command(Guid ProjectId, string EnvironmentName) : ICommand<Response>;