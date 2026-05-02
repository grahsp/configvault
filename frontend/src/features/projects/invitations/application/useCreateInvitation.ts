import { useMutation } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { createInvitation } from '../api/invitationsApi.ts'

export function useCreateInvitation(projectId: string) {
  const client = useAuthenticatedApiClient()

  return useMutation({
    mutationFn: () => createInvitation(client, projectId),
  })
}
