import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { createEnvironment } from '../api/environmentsApi'
import type { Environment } from './environment'
import { environmentQueryKeys } from './environmentQueryKeys'

export function useCreateEnvironment(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (environmentName: string) =>
      createEnvironment(client, projectId, environmentName),
    onSuccess: (createdEnvironment) => {
      queryClient.setQueryData<Environment[]>(
        environmentQueryKeys.list(projectId),
        (currentEnvironments = []) => {
          if (
            currentEnvironments.some(
              (environment) => environment.id === createdEnvironment.id,
            )
          ) {
            return currentEnvironments
          }

          return [...currentEnvironments, createdEnvironment]
        },
      )
    },
  })
}
