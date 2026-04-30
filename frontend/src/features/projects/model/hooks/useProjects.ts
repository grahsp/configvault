import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { listProjects } from '../../api'
import { projectQueryKeys } from '../projectQueryKeys.ts'

export function useProjects() {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: projectQueryKeys.list(),
    queryFn: () => listProjects(client),
  })
}
