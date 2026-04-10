using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.GetProjectDetails;

public sealed record GetProjectDetailsQuery(Guid Id) : IQuery<ProjectDetails?>;