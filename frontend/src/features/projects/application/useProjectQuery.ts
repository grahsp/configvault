import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient.ts'
import { getProject } from '../api'
import { projectQueryKeys } from './projectQueryKeys.ts'

export function useProject(projectId: string) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: projectQueryKeys.detail(projectId),
    queryFn: () => getProject(client, projectId),
    enabled: Boolean(projectId),
  })
}
