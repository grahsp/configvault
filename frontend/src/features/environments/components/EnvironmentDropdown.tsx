import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { createApiClient } from '../../../api/apiClient'
import { useAuth } from '../../../shared/hooks/useAuth'
import { cx } from '../../../shared/utils/cx'
import { createEnvironment, deleteEnvironment, getEnvironments } from '../api'
import type { Environment } from '../types'
import styles from './EnvironmentDropdown.module.css'

interface EnvironmentDropdownProps {
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange?: (environment: Environment | null) => void
  projectId: string
  selectedEnvironmentId: string
}

interface EnvironmentState {
  environments: Environment[]
  hasError: boolean
  isLoading: boolean
}

type EnvironmentAction =
  | { type: 'load' }
  | { environments: Environment[]; type: 'success' }
  | { environment: Environment; type: 'append' }
  | { environmentId: string; type: 'remove' }
  | { type: 'error' }

const initialEnvironmentState: EnvironmentState = {
  environments: [],
  hasError: false,
  isLoading: false,
}

function environmentReducer(
  state: EnvironmentState,
  action: EnvironmentAction,
): EnvironmentState {
  switch (action.type) {
    case 'load':
      return {
        ...state,
        hasError: false,
        isLoading: true,
      }
    case 'success':
      return {
        environments: action.environments,
        hasError: false,
        isLoading: false,
      }
    case 'append':
      return {
        ...state,
        environments: [...state.environments, action.environment],
      }
    case 'remove':
      return {
        ...state,
        environments: state.environments.filter(
          (environment) => environment.id !== action.environmentId,
        ),
      }
    case 'error':
      return {
        environments: [],
        hasError: true,
        isLoading: false,
      }
  }
}

export function EnvironmentDropdown({
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: EnvironmentDropdownProps) {
  const { getAccessTokenSilently } = useAuth()
  const client = useMemo(
    () => createApiClient({ getAccessTokenSilently }),
    [getAccessTokenSilently],
  )
  const listboxId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const selectedEnvironmentIdRef = useRef(selectedEnvironmentId)
  const onEnvironmentChangeRef = useRef(onEnvironmentChange)
  const [{ environments, hasError, isLoading }, dispatch] = useReducer(
    environmentReducer,
    initialEnvironmentState,
  )
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreatePending, setIsCreatePending] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletingEnvironmentId, setDeletingEnvironmentId] = useState('')
  const [environmentPendingDelete, setEnvironmentPendingDelete] =
    useState<Environment | null>(null)
  const isCreatePendingRef = useRef(false)
  const createInputRef = useRef<HTMLInputElement>(null)
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
    if (!projectId) {
      return
    }

    let isCurrent = true

    dispatch({ type: 'load' })

    getEnvironments(client, projectId)
      .then((nextEnvironments) => {
        if (!isCurrent) {
          return
        }

        dispatch({ environments: nextEnvironments, type: 'success' })
        setActiveIndex(0)

        if (!selectedEnvironmentIdRef.current && nextEnvironments[0]) {
          onEnvironmentChangeRef.current(nextEnvironments[0].id)
        }
      })
      .catch(() => {
        if (!isCurrent) {
          return
        }

        dispatch({ type: 'error' })
      })

    return () => {
      isCurrent = false
    }
  }, [client, projectId])

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
    setIsCreatePending(false)
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
      const nextEnvironments = await getEnvironments(client, projectId)
      const recoveredEnvironment = nextEnvironments.find(
        (environment) =>
          environment.environmentName.trim().toLocaleLowerCase() ===
          environmentName.toLocaleLowerCase(),
      )

      if (!recoveredEnvironment) {
        return false
      }

      dispatch({ environments: nextEnvironments, type: 'success' })
      onEnvironmentChange(recoveredEnvironment.id)
      closeDropdown()

      return true
    } catch {
      return false
    }
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isCreatePendingRef.current) {
      return
    }

    const trimmedName = createName.trim()

    if (!trimmedName) {
      setCreateError('Enter an environment name.')
      return
    }

    const normalizedName = trimmedName.toLocaleLowerCase()
    const hasDuplicate = environments.some(
      (environment) =>
        environment.environmentName.trim().toLocaleLowerCase() ===
        normalizedName,
    )

    if (hasDuplicate) {
      setCreateError('Environment already exists.')
      return
    }

    isCreatePendingRef.current = true
    setIsCreatePending(true)
    setCreateError('')

    let environment: Environment

    try {
      environment = await createEnvironment(client, projectId, trimmedName)
    } catch {
      const wasCreated = await recoverCreatedEnvironment(trimmedName)

      if (wasCreated) {
        return
      }

      setCreateError('Environment could not be created.')
      isCreatePendingRef.current = false
      setIsCreatePending(false)
      return
    }

    dispatch({ environment, type: 'append' })
    onEnvironmentChange(environment.id)
    closeDropdown()
  }

  async function handleDeleteEnvironment() {
    if (
      deletingEnvironmentId ||
      environments.length <= 1 ||
      !environmentPendingDelete
    ) {
      return
    }

    setDeleteError('')
    setDeletingEnvironmentId(environmentPendingDelete.id)

    try {
      await deleteEnvironment(client, projectId, environmentPendingDelete.id)

      const nextEnvironments = environments.filter(
        (nextEnvironment) =>
          nextEnvironment.id !== environmentPendingDelete.id,
      )

      dispatch({ environmentId: environmentPendingDelete.id, type: 'remove' })
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

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
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

  const triggerLabel = isLoading
    ? 'Loading...'
    : selectedEnvironment?.environmentName ?? 'Select environment'

  return (
    <div className={styles.environmentDropdown} ref={wrapperRef}>
      <button
        aria-activedescendant={isOpen ? activeOptionId : undefined}
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={styles.trigger}
        disabled={isLoading}
        onClick={() => {
          if (isOpen) {
            closeDropdown()
            return
          }

          openDropdown()
        }}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        <span>{triggerLabel}</span>
        <span className={styles.chevron} aria-hidden="true">
          v
        </span>
      </button>

      {isOpen ? (
        <div className={styles.menu} id={listboxId} role="listbox">
          {hasError ? (
            <p className={styles.errorState} role="alert">
              Environments could not load.
            </p>
          ) : null}

          {!hasError && environments.length === 0 ? (
            <p className={styles.emptyState}>No environments found</p>
          ) : null}

          {!hasError
            ? environments.map((environment, index) => (
                <div className={styles.optionRow} key={environment.id}>
                  <button
                    aria-selected={environment.id === selectedEnvironmentId}
                    className={cx(
                      styles.option,
                      index === activeIndex && styles.optionActive,
                      environment.id === selectedEnvironmentId &&
                        styles.optionSelected,
                    )}
                    id={`${listboxId}-option-${environment.id}`}
                    onClick={() => selectEnvironment(environment)}
                    role="option"
                    type="button"
                  >
                    {environment.environmentName}
                  </button>
                  <button
                    aria-label={
                      environments.length <= 1
                        ? `Cannot delete ${environment.environmentName} because it is the only environment`
                        : `Delete ${environment.environmentName}`
                    }
                    className={styles.deleteAction}
                    disabled={
                      environments.length <= 1 ||
                      deletingEnvironmentId === environment.id
                    }
                    onClick={() => openDeleteDialog(environment)}
                    type="button"
                  >
                    {deletingEnvironmentId === environment.id
                      ? 'Deleting'
                      : 'Delete'}
                  </button>
                </div>
              ))
            : null}

          {!hasError ? (
            <>
              <div className={styles.divider} role="separator" />
              {isCreating ? (
                <form
                  className={styles.createForm}
                  onSubmit={handleCreateSubmit}
                >
                  <label className={styles.createLabel}>
                    Environment name
                    <input
                      aria-describedby={
                        createError ? `${listboxId}-create-error` : undefined
                      }
                      aria-invalid={Boolean(createError)}
                      className={styles.createInput}
                      disabled={isCreatePending}
                      onChange={(event) => {
                        setCreateName(event.target.value)
                        setCreateError('')
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          resetCreateState()
                        }
                      }}
                      ref={createInputRef}
                      type="text"
                      value={createName}
                    />
                  </label>

                  {createError ? (
                    <p
                      className={styles.createError}
                      id={`${listboxId}-create-error`}
                      role="alert"
                    >
                      {createError}
                    </p>
                  ) : null}

                  <div className={styles.createActions}>
                    <button
                      className={cx(styles.createButton, styles.createSubmit)}
                      disabled={isCreatePending}
                      type="submit"
                    >
                      {isCreatePending ? 'Creating' : 'Create'}
                    </button>
                    <button
                      className={cx(styles.createButton, styles.createCancel)}
                      disabled={isCreatePending}
                      onClick={resetCreateState}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className={styles.addAction}
                  onClick={() => {
                    setIsCreating(true)
                    setCreateError('')
                  }}
                  type="button"
                >
                  + Add environment
                </button>
              )}
            </>
          ) : null}
        </div>
      ) : null}

      {environmentPendingDelete ? (
        <DeleteEnvironmentDialog
          deleteError={deleteError}
          environment={environmentPendingDelete}
          isPending={deletingEnvironmentId === environmentPendingDelete.id}
          onCancel={closeDeleteDialog}
          onConfirm={handleDeleteEnvironment}
        />
      ) : null}
    </div>
  )
}

function DeleteEnvironmentDialog({
  deleteError,
  environment,
  isPending,
  onCancel,
  onConfirm,
}: {
  deleteError: string
  environment: Environment
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="delete-environment-title"
        aria-modal="true"
        className={cx(styles.modal, styles.modalCompact)}
        role="dialog"
      >
        <h2 id="delete-environment-title">Delete environment</h2>
        <p className={styles.modalCopy}>
          Delete this environment from the project?
        </p>
        <p className={styles.modalCopy}>
          {environment.environmentName} and its associated configuration values
          will be removed.
        </p>

        {deleteError ? (
          <p className={styles.createError} role="alert">
            {deleteError}
          </p>
        ) : null}

        <div className={styles.modalActions}>
          <button
            className={cx(styles.modalButton, styles.modalButtonSecondary)}
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={cx(styles.modalButton, styles.modalButtonDanger)}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
