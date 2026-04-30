export const secretsQueryKeys = {
  all: ['secrets'] as const,
  lists: () => [...secretsQueryKeys.all, 'list'] as const,
  list: (projectId: string, environmentName: string) =>
    [...secretsQueryKeys.lists(), projectId, environmentName] as const,
}
