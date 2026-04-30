export const configItemQueryKeys = {
  all: ['config-items'] as const,
  lists: () => [...configItemQueryKeys.all, 'list'] as const,
  list: (projectId: string, environmentName: string) =>
    [...configItemQueryKeys.lists(), projectId, environmentName] as const,
}
