using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Queries.GetEnvironments;

public sealed record Query(Guid ProjectId) : IQuery<IReadOnlyList<Response>>;