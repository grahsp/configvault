import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import {
  exportSecrets,
  getSecretValue,
  importSecrets,
  saveSecrets,
  type SecretBatchOperation,
} from '../api'
import type { Secret, SecretValue } from '../domain'
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

function applySuccessfulValueUpdates(
  secrets: Secret[],
  operations: SecretBatchOperation[],
) {
  const updatedRevisions = new Map(
    operations
      .filter(
        (
          operation,
        ): operation is Extract<SecretBatchOperation, { type: 'set-value' }> =>
          operation.type === 'set-value',
      )
      .map((operation) => [
        operation.secretId,
        operation.expectedRevision + 1,
      ]),
  )

  if (updatedRevisions.size === 0) {
    return secrets
  }

  return secrets.map((secret) => {
    const nextRevision = updatedRevisions.get(secret.id)

    return nextRevision === undefined
      ? secret
      : {
          ...secret,
          hasValue: true,
          revision: nextRevision,
        }
  })
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
    onSuccess: (_data, { operations }) => {
      queryClient.setQueryData<Secret[]>(queryKey, (current = []) =>
        applySuccessfulValueUpdates(current, operations),
      )
      queryClient.invalidateQueries({ queryKey })
    },
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
    onSuccess: (_data, { expectedRevision, secretId }) => {
      queryClient.setQueryData<Secret[]>(queryKey, (current = []) =>
        current.map((secret) =>
          secret.id === secretId
            ? { ...secret, hasValue: true, revision: expectedRevision + 1 }
            : secret,
        ),
      )
      queryClient.invalidateQueries({ queryKey })
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

export type UseSecretsMutationsResult = ReturnType<typeof useSecretsMutations>
