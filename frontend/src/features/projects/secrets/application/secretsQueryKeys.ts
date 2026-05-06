export const secretsQueryKeys = {
  all: ['secrets'] as const,
  lists: () => [...secretsQueryKeys.all, 'list'] as const,
  list: (projectId: string, environmentName: string) =>
    [...secretsQueryKeys.lists(), projectId, environmentName] as const,
  revisions: (
    projectId: string,
    environmentName: string,
    secretId: string,
  ) =>
    [
      ...secretsQueryKeys.all,
      'revisions',
      projectId,
      environmentName,
      secretId,
    ] as const,
  revision: (
    projectId: string,
    environmentName: string,
    secretId: string,
    revision: number,
  ) =>
    [
      ...secretsQueryKeys.revisions(projectId, environmentName, secretId),
      revision,
    ] as const,
}
