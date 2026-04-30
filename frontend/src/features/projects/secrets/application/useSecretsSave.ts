import { useToast } from '../../../../shared/components/toast/useToast.ts'
import type { Secret } from '../domain'
import {
  buildSaveOperations,
  getAffectedValueIds,
  omitRevealedValues,
} from './secretsSavePlan.ts'
import { getErrorMessage, getSuccessMessage } from './secretsOperationMessages.ts'
import type { SecretsSaveController } from './secretsEditor.types.ts'
import type { UseSecretsMutationsResult } from './useSecretsMutations.ts'

interface UseSecretsSaveOptions {
  handleCancelEdit: () => void
  mutations: UseSecretsMutationsResult
  secrets: Secret[]
  state: SecretsSaveController
}

export function useSecretsSave({
  handleCancelEdit,
  mutations,
  secrets,
  state,
}: UseSecretsSaveOptions) {
  const { addToast } = useToast()

  async function handleSaveEdit() {
    const { invalidSecretIds, operations } = buildSaveOperations({
      secrets,
      drafts: state.drafts,
      newSecrets: state.newSecrets,
      pendingDeletionIds: state.pendingDeletionIds,
    })

    if (invalidSecretIds.length > 0) {
      state.setHighlightedValidationIds(invalidSecretIds)
      return
    }

    if (operations.length === 0) {
      handleCancelEdit()
      return
    }

    try {
      await mutations.saveSecrets.mutateAsync({ operations })

      const affectedValueIds = getAffectedValueIds(operations)

      state.setRevealedValues((current) =>
        omitRevealedValues(current, affectedValueIds),
      )
      state.setVisibleRevealedValues((current) =>
        omitRevealedValues(current, affectedValueIds),
      )

      addToast({
        message: getSuccessMessage(operations),
        type: 'success',
      })
      handleCancelEdit()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to update secret'),
        type: 'error',
      })
    }
  }

  return {
    onSaveEdit: handleSaveEdit,
  }
}
