import { useEffect, useRef } from 'react'
import type { Environment } from '../domain'

interface UseEnvironmentSelectionOptions {
  environments: Environment[]
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange?: (environment: Environment | null) => void
  projectId: string
  selectedEnvironmentId: string
}

export function useEnvironmentSelection({
  environments,
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: UseEnvironmentSelectionOptions) {
  const selectedEnvironmentIdRef = useRef(selectedEnvironmentId)
  const onEnvironmentChangeRef = useRef(onEnvironmentChange)

  const selectedEnvironment = environments.find(
    (environment) => environment.id === selectedEnvironmentId,
  )
  const selectedIndex = environments.findIndex(
    (environment) => environment.id === selectedEnvironmentId,
  )

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

  return {
    selectedEnvironment,
    selectedIndex,
  }
}
