import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { addMember } from '../api'
import { projectQueryKeys } from '../../application'

export function useAddMember(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => addMember(client, projectId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.members(projectId),
      }),
  })
}
