import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { deleteEnvironment } from '../api/environmentsApi.ts'
import type { Environment } from './environment.ts'
import { environmentQueryKeys } from './environmentQueryKeys.ts'

export function useDeleteEnvironment(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (environmentId: string) =>
      deleteEnvironment(client, projectId, environmentId),
    onSuccess: (_data, environmentId) => {
      queryClient.setQueryData<Environment[]>(
        environmentQueryKeys.list(projectId),
        (currentEnvironments = []) =>
          currentEnvironments.filter(
            (environment) => environment.id !== environmentId,
          ),
      )
    },
  })
}
