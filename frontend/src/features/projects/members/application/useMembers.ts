import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { getMembers } from '../api'
import { projectQueryKeys } from '../../application'

export function useMembers(projectId: string) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: projectQueryKeys.members(projectId),
    queryFn: () => getMembers(client, projectId),
    enabled: Boolean(projectId),
  })
}
