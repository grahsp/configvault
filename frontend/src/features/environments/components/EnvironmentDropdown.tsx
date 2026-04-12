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
import { createEnvironment, getEnvironments } from '../api'
import type { Environment } from '../types'
import styles from './EnvironmentDropdown.module.css'

interface EnvironmentDropdownProps {
  onEnvironmentChange: (environmentId: string) => void
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
    setIsCreating(false)
    setCreateName('')
    setCreateError('')
    setIsCreatePending(false)
  }

  function closeDropdown() {
    setIsOpen(false)
    resetCreateState()
  }

  function openDropdown() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }

  function selectEnvironment(environment: Environment) {
    onEnvironmentChange(environment.id)
    closeDropdown()
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isCreatePending) {
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

    setIsCreatePending(true)
    setCreateError('')

    try {
      const environment = await createEnvironment(client, projectId, trimmedName)

      dispatch({ environment, type: 'append' })
      onEnvironmentChange(environment.id)
      closeDropdown()
    } catch {
      setCreateError('Environment could not be created.')
      setIsCreatePending(false)
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
    ? 'Environment: [ loading... ]'
    : `Environment: [ ${
        selectedEnvironment?.environmentName ?? 'Select environment'
      } ]`

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
                <button
                  aria-selected={environment.id === selectedEnvironmentId}
                  className={cx(
                    styles.option,
                    index === activeIndex && styles.optionActive,
                    environment.id === selectedEnvironmentId &&
                      styles.optionSelected,
                  )}
                  id={`${listboxId}-option-${environment.id}`}
                  key={environment.id}
                  onClick={() => selectEnvironment(environment)}
                  role="option"
                  type="button"
                >
                  {environment.environmentName}
                </button>
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
    </div>
  )
}
