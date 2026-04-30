export const secretsQueryKeys = {
  all: ['config-items'] as const,
  lists: () => [...secretsQueryKeys.all, 'list'] as const,
  list: (projectId: string, environmentName: string) =>
    [...secretsQueryKeys.lists(), projectId, environmentName] as const,
}
