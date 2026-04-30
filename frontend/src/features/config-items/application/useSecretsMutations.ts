import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient.ts'
import {
  exportSecrets,
  getSecretValue,
  importSecrets,
  saveSecrets,
  upsertSecretValue,
  type SecretBatchOperation,
} from '../api'
import type { Secret, SecretValue } from '../domain'
import { secretsQueryKeys } from './secretsQueryKeys'

interface SaveSecretsVariables {
  operations: SecretBatchOperation[]
}

interface RevealSecretValueVariables {
  secretId: string
}

interface UpsertSecretValueVariables {
  secretId: string
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
    mutationFn: ({ secretId, value }) =>
      upsertSecretValue(
        client,
        projectId,
        secretId,
        environmentName,
        value,
      ),
    onSuccess: (_data, { secretId }) => {
      queryClient.setQueryData<Secret[]>(queryKey, (current = []) =>
        current.map((secret) =>
          secret.id === secretId ? { ...secret, hasValue: true } : secret,
        ),
      )
    },
  })

  return {
    exportSecrets: exportMutation,
    importSecrets: importMutation,
    revealSecretValue: revealValueMutation,
    saveSecrets: saveMutation,
    upsertSecretValue: upsertValueMutation,
  }
}
