import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient'
import { removeMember } from '../api'
import { projectQueryKeys } from '../../model'

export function useRemoveMember(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => removeMember(client, projectId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.members(projectId),
      }),
  })
}
