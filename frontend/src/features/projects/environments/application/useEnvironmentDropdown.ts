import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import {
  normalizeEnvironmentName,
  validateEnvironmentName,
} from '../domain'
import type { Environment } from '../domain'
import type { EnvironmentDropdownProps } from '../ui/EnvironmentDropdown'
import { useCreateEnvironment } from './useCreateEnvironment.ts'
import { useDeleteEnvironment } from './useDeleteEnvironment.ts'
import { useEnvironments } from './useEnvironments.ts'

interface UseEnvironmentDropdownOptions {
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange?: (environment: Environment | null) => void
  projectId: string
  selectedEnvironmentId: string
}

export function useEnvironmentDropdown({
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: UseEnvironmentDropdownOptions): EnvironmentDropdownProps {
  const listboxId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const createInputRef = useRef<HTMLInputElement>(null)
  const selectedEnvironmentIdRef = useRef(selectedEnvironmentId)
  const onEnvironmentChangeRef = useRef(onEnvironmentChange)
  const isCreatePendingRef = useRef(false)

  const environmentsQuery = useEnvironments(projectId)
  const createEnvironmentMutation = useCreateEnvironment(projectId)
  const deleteEnvironmentMutation = useDeleteEnvironment(projectId)

  const environments = environmentsQuery.data ?? []
  const isLoading = environmentsQuery.isPending
  const hasError = environmentsQuery.isError

  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deletingEnvironmentId, setDeletingEnvironmentId] = useState('')
  const [environmentPendingDelete, setEnvironmentPendingDelete] =
    useState<Environment | null>(null)

  const selectedEnvironment = environments.find(
    (environment) => environment.id === selectedEnvironmentId,
  )
  const selectedIndex = environments.findIndex(
    (environment) => environment.id === selectedEnvironmentId,
  )
  const activeEnvironment = environments[activeIndex]
  const activeOptionId = activeEnvironment
    ? `${listboxId}-option-${activeEnvironment.id}`
    : undefined

  useEffect(() => {
    selectedEnvironmentIdRef.current = selectedEnvironmentId
  }, [selectedEnvironmentId])

  useEffect(() => {
    onEnvironmentChangeRef.current = onEnvironmentChange
  }, [onEnvironmentChange])

  useEffect(() => {
    onSelectedEnvironmentChange?.(selectedEnvironment ?? null)
  }, [onSelectedEnvironmentChange, selectedEnvironment])

  useEffect(() => {
    if (!projectId || selectedEnvironmentIdRef.current || !environments[0]) {
      return
    }

    onEnvironmentChangeRef.current(environments[0].id)
  }, [environments, projectId])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleMouseDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)

    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

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

  function closeDropdown() {
    setIsOpen(false)
    setDeleteError('')
    setEnvironmentPendingDelete(null)
    resetCreateState()
  }

  function openDropdown() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setDeleteError('')
    setIsOpen(true)
  }

  function selectEnvironment(environment: Environment) {
    onEnvironmentChange(environment.id)
    closeDropdown()
  }

  function openDeleteDialog(environment: Environment) {
    if (environments.length <= 1) {
      return
    }

    setDeleteError('')
    setEnvironmentPendingDelete(environment)
  }

  function closeDeleteDialog() {
    if (deletingEnvironmentId) {
      return
    }

    setDeleteError('')
    setEnvironmentPendingDelete(null)
  }

  async function recoverCreatedEnvironment(environmentName: string) {
    try {
      const result = await environmentsQuery.refetch()
      const nextEnvironments = result.data ?? []
      const recoveredEnvironment = nextEnvironments.find(
        (environment) =>
          normalizeEnvironmentName(environment.environmentName) ===
          normalizeEnvironmentName(environmentName),
      )

      if (!recoveredEnvironment) {
        return false
      }

      onEnvironmentChange(recoveredEnvironment.id)
      closeDropdown()

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
      const environment = await createEnvironmentMutation.mutateAsync(createName)
      onEnvironmentChange(environment.id)
      closeDropdown()
    } catch {
      const wasCreated = await recoverCreatedEnvironment(createName)

      if (wasCreated) {
        return
      }

      setCreateError('Environment could not be created.')
      isCreatePendingRef.current = false
    }
  }

  async function onDeleteConfirm() {
    if (
      deletingEnvironmentId ||
      environments.length <= 1 ||
      !environmentPendingDelete
    ) {
      return
    }

    const nextEnvironments = environments.filter(
      (environment) => environment.id !== environmentPendingDelete.id,
    )

    setDeleteError('')
    setDeletingEnvironmentId(environmentPendingDelete.id)

    try {
      await deleteEnvironmentMutation.mutateAsync(environmentPendingDelete.id)
      setActiveIndex((currentIndex) =>
        Math.min(currentIndex, Math.max(nextEnvironments.length - 1, 0)),
      )
      setIsOpen(false)
      setEnvironmentPendingDelete(null)

      if (environmentPendingDelete.id === selectedEnvironmentId) {
        onEnvironmentChange(nextEnvironments[0]?.id ?? '')
      }
    } catch {
      setDeleteError('Environment could not be deleted.')
    } finally {
      setDeletingEnvironmentId('')
    }
  }

  function moveActiveIndex(direction: 1 | -1) {
    if (environments.length === 0) {
      return
    }

    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + direction

      if (nextIndex < 0) {
        return environments.length - 1
      }

      if (nextIndex >= environments.length) {
        return 0
      }

      return nextIndex
    })
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      closeDropdown()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      if (!isOpen) {
        openDropdown()
        return
      }

      moveActiveIndex(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      if (!isOpen) {
        openDropdown()
        return
      }

      if (activeEnvironment) {
        selectEnvironment(activeEnvironment)
      }
    }
  }

  function onTriggerClick() {
    if (isOpen) {
      closeDropdown()
      return
    }

    openDropdown()
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

  const triggerLabel = isLoading
    ? 'Loading...'
    : selectedEnvironment?.environmentName ?? 'Select environment'

  return {
    create: {
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
    },
    deleteDialog: environmentPendingDelete
      ? {
          deleteError,
          environment: environmentPendingDelete,
          isPending: deletingEnvironmentId === environmentPendingDelete.id,
          onCancel: closeDeleteDialog,
          onConfirm: onDeleteConfirm,
        }
      : null,
    list: {
      activeIndex,
      deletingEnvironmentId,
      environments,
      listboxId,
      onOpenDeleteDialog: openDeleteDialog,
      onSelectEnvironment: selectEnvironment,
      selectedEnvironmentId,
    },
    menu: {
      hasError,
      isOpen,
      listboxId,
      wrapperRef,
    },
    trigger: {
      activeOptionId,
      isLoading,
      isOpen,
      listboxId,
      onClick: onTriggerClick,
      onKeyDown: onTriggerKeyDown,
      triggerLabel,
    },
  }
}
