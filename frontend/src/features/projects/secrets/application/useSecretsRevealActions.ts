import { useToast } from '../../../../shared/components/toast/useToast.ts'
import type { Secret } from '../domain'
import { getErrorMessage } from './secretsOperationMessages.ts'
import type { SecretsRevealController } from './secretsEditor.types.ts'
import type { UseSecretsMutationsResult } from './useSecretsMutations.ts'

interface UseSecretsRevealActionsOptions {
  mutations: UseSecretsMutationsResult
  state: SecretsRevealController
}

export function useSecretsRevealActions({
  mutations,
  state,
}: UseSecretsRevealActionsOptions) {
  const { addToast } = useToast()

  async function handleReveal(secret: Secret) {
    if (state.visibleRevealedValues[secret.id]) {
      state.setVisibleRevealedValues((current) => ({
        ...current,
        [secret.id]: false,
      }))
      return
    }

    if (state.revealedValues[secret.id] !== undefined) {
      state.setVisibleRevealedValues((current) => ({
        ...current,
        [secret.id]: true,
      }))
      return
    }

    try {
      state.setRevealingId(secret.id)
      const secretValue = await mutations.revealSecretValue.mutateAsync({
        secretId: secret.id,
      })
      state.setRevealedValues((current) => ({
        ...current,
        [secret.id]: secretValue.value,
      }))
      state.setVisibleRevealedValues((current) => ({
        ...current,
        [secret.id]: true,
      }))
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to reveal secret value'),
        type: 'error',
      })
    } finally {
      state.setRevealingId(null)
    }
  }

  async function handleStartValueEdit(secret: Secret) {
    if (!secret.hasValue) {
      return
    }

    const existingDraft = state.drafts[secret.id]

    if (existingDraft?.value !== null && existingDraft?.value !== undefined) {
      return
    }

    if (state.revealedValues[secret.id] !== undefined) {
      state.setDrafts((current) => ({
        ...current,
        [secret.id]: {
          key: current[secret.id]?.key ?? secret.key,
          value: state.revealedValues[secret.id],
        },
      }))
      return
    }

    try {
      state.setRevealingId(secret.id)
      const secretValue = await mutations.revealSecretValue.mutateAsync({
        secretId: secret.id,
      })
      state.setRevealedValues((current) => ({
        ...current,
        [secret.id]: secretValue.value,
      }))
      state.setDrafts((current) => ({
        ...current,
        [secret.id]: {
          key: current[secret.id]?.key ?? secret.key,
          value: secretValue.value,
        },
      }))
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to reveal secret value'),
        type: 'error',
      })
    } finally {
      state.setRevealingId((current) => (current === secret.id ? null : current))
    }
  }

  return {
    onReveal: handleReveal,
    onStartValueEdit: handleStartValueEdit,
  }
}
