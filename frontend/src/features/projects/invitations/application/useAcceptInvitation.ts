import { useMutation } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { acceptInvitation } from '../api/invitationsApi.ts'

interface AcceptInvitationInput {
  token: string
}

export function useAcceptInvitation() {
  const client = useAuthenticatedApiClient()

  return useMutation({
    mutationFn: ({ token }: AcceptInvitationInput) => acceptInvitation(client, token),
  })
}
