using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.GetProjectList;

public sealed record GetProjectListQuery : IQuery<IReadOnlyList<ProjectListItem>>;