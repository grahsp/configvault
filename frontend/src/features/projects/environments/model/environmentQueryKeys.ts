export const environmentQueryKeys = {
  all: ['environments'] as const,
  lists: () => [...environmentQueryKeys.all, 'list'] as const,
  list: (projectId: string) =>
    [...environmentQueryKeys.lists(), projectId] as const,
}
