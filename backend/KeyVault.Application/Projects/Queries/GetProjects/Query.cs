using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Queries.GetProjects;

public sealed record Query : IQuery<IReadOnlyList<Response>>;