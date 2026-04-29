import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteEnvironment } from '../api/environmentsApi'
import type { Environment } from './environment'
import { environmentQueryKeys } from './environmentQueryKeys'
import { useAuthenticatedEnvironmentClient } from './useEnvironments'

export function useDeleteEnvironment(projectId: string) {
  const client = useAuthenticatedEnvironmentClient()
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
