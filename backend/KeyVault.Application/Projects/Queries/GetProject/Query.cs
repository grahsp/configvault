using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed record Query(Guid ProjectId) : IQuery<Response?>;