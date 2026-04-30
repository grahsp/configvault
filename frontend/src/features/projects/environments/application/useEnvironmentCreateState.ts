import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  normalizeEnvironmentName,
  validateEnvironmentName,
} from '../domain'
import type { Environment } from '../domain'

interface CreateEnvironmentMutation {
  isPending: boolean
  mutateAsync: (environmentName: string) => Promise<Environment>
}

interface UseEnvironmentCreateStateOptions {
  createEnvironmentMutation: CreateEnvironmentMutation
  environments: Environment[]
  listboxId: string
  onCreatedEnvironment: (environmentId: string) => void
  onRequestCloseDropdown: () => void
  refetchEnvironments: () => Promise<{ data?: Environment[] }>
}

export function useEnvironmentCreateState({
  createEnvironmentMutation,
  environments,
  listboxId,
  onCreatedEnvironment,
  onRequestCloseDropdown,
  refetchEnvironments,
}: UseEnvironmentCreateStateOptions) {
  const createInputRef = useRef<HTMLInputElement>(null)
  const isCreatePendingRef = useRef(false)

  const [isCreating, setIsCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (isCreating) {
      createInputRef.current?.focus()
    }
  }, [isCreating])

  function resetCreateState() {
    isCreatePendingRef.current = false
    setIsCreating(false)
    setCreateName('')
    setCreateError('')
  }

  async function recoverCreatedEnvironment(environmentName: string) {
    try {
      const result = await refetchEnvironments()
      const nextEnvironments = result.data ?? []
      const recoveredEnvironment = nextEnvironments.find(
        (environment) =>
          normalizeEnvironmentName(environment.environmentName) ===
          normalizeEnvironmentName(environmentName),
      )

      if (!recoveredEnvironment) {
        return false
      }

      onCreatedEnvironment(recoveredEnvironment.id)
      onRequestCloseDropdown()

      return true
    } catch {
      return false
    }
  }

  async function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isCreatePendingRef.current) {
      return
    }

    const validationError = validateEnvironmentName(createName, environments)

    if (validationError) {
      setCreateError(validationError)
      return
    }

    isCreatePendingRef.current = true
    setCreateError('')

    try {
      const environment =
        await createEnvironmentMutation.mutateAsync(createName)
      onCreatedEnvironment(environment.id)
      onRequestCloseDropdown()
    } catch {
      const wasCreated = await recoverCreatedEnvironment(createName)

      if (wasCreated) {
        return
      }

      setCreateError('Environment could not be created.')
      isCreatePendingRef.current = false
    }
  }

  function onCreateInputChange(environmentName: string) {
    setCreateName(environmentName)
    setCreateError('')
  }

  function onCreateInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      resetCreateState()
    }
  }

  function onCreateStart() {
    setIsCreating(true)
    setCreateError('')
  }

  return {
    createError,
    createInputRef,
    createName,
    isCreatePending: createEnvironmentMutation.isPending,
    isCreating,
    listboxId,
    onCreateInputChange,
    onCreateInputKeyDown,
    onCreateStart,
    onResetCreateState: resetCreateState,
    onSubmitCreate,
  }
}
