import {
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
import { getEnvironments } from '../api'
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

  function openDropdown() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }

  function selectEnvironment(environment: Environment) {
    onEnvironmentChange(environment.id)
    setIsOpen(false)
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
      setIsOpen(false)
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
            setIsOpen(false)
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
              <button className={styles.addAction} type="button">
                + Add environment
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
