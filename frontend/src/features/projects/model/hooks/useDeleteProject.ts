import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { deleteProject } from '../../api'
import { projectQueryKeys } from '../projectQueryKeys.ts'

export function useDeleteProject() {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(client, projectId),
    onSuccess: (_data, projectId) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(projectId),
        }),
      ]),
  })
}
