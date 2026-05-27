import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import {
  exportSecrets,
  getSecretValue,
  importSecrets,
  saveSecrets,
  type SecretBatchOperation,
} from '../api'
import type { SecretValue } from '../domain'
import { secretsQueryKeys } from './secretsQueryKeys.ts'

interface SaveSecretsVariables {
  operations: SecretBatchOperation[]
}

interface RevealSecretValueVariables {
  secretId: string
}

interface UpsertSecretValueVariables {
  secretId: string
  expectedRevision: number
  value: string
}

export function useSecretsMutations(
  projectId: string,
  environmentName: string,
) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = secretsQueryKeys.list(projectId, environmentName)

  const exportMutation = useMutation<string, Error>({
    mutationFn: () => exportSecrets(client, projectId, environmentName),
  })

  const importMutation = useMutation<void, Error, string>({
    mutationFn: (content) =>
      importSecrets(client, projectId, environmentName, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const revealValueMutation = useMutation<
    SecretValue,
    Error,
    RevealSecretValueVariables
  >({
    mutationFn: ({ secretId }) =>
      getSecretValue(client, projectId, secretId, environmentName),
  })

  const saveMutation = useMutation<void, Error, SaveSecretsVariables>({
    mutationFn: ({ operations }) =>
      saveSecrets(client, projectId, environmentName, operations),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const upsertValueMutation = useMutation<
    void,
    Error,
    UpsertSecretValueVariables
  >({
    mutationFn: ({ expectedRevision, secretId, value }) =>
      saveSecrets(
        client,
        projectId,
        environmentName,
        [{ type: 'set-value', secretId, value, expectedRevision }],
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    exportSecrets: exportMutation,
    importSecrets: importMutation,
    revealSecretValue: revealValueMutation,
    saveSecrets: saveMutation,
    upsertSecretValue: upsertValueMutation,
  }
}

export type UseSecretsMutationsResult = ReturnType<typeof useSecretsMutations>
