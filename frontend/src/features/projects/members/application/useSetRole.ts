import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient'
import { setRole } from '../api'
import { projectQueryKeys } from '../../application'
import type { ProjectRole } from '../domain'

export function useSetRole(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      role,
      userId,
    }: {
      role: ProjectRole
      userId: string
    }) => setRole(client, projectId, userId, role),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.members(projectId),
      }),
  })
}
