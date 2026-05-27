import { toast } from 'sonner'
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
  async function handleSaveEdit() {
    const { invalidSecretIds, operations } = buildSaveOperations({
      secrets,
      drafts: state.drafts,
      newSecrets: state.newSecrets,
      pendingDeletionIds: state.pendingDeletionIds,
      revealedValueRevisions: state.revealedValueRevisions,
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
      state.setRevealedValueRevisions((current) =>
        omitRevealedValues(current, affectedValueIds),
      )
      state.setVisibleRevealedValues((current) =>
        omitRevealedValues(current, affectedValueIds),
      )

      toast.success(getSuccessMessage(operations))
      handleCancelEdit()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update secret'))
    }
  }

  return {
    onSaveEdit: handleSaveEdit,
  }
}
