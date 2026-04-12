export const configItemQueryKeys = {
  all: ['config-items'] as const,
  lists: () => [...configItemQueryKeys.all, 'list'] as const,
  list: (projectId: string) =>
    [...configItemQueryKeys.lists(), projectId] as const,
}
