using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Queries.GetMembers;

public sealed record Query(Guid ProjectId) : IQuery<IReadOnlyList<Response>>;