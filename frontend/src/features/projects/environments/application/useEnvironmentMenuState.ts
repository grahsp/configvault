import {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import type { Environment } from '../domain'

interface UseEnvironmentMenuStateOptions {
  environments: Environment[]
  onCloseDropdown: () => void
  onSelectEnvironment: (environment: Environment) => void
  selectedIndex: number
}

export function useEnvironmentMenuState({
  environments,
  onCloseDropdown,
  onSelectEnvironment,
  selectedIndex,
}: UseEnvironmentMenuStateOptions) {
  const listboxId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const activeEnvironment = environments[activeIndex]
  const activeOptionId = activeEnvironment
    ? `${listboxId}-option-${activeEnvironment.id}`
    : undefined

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleMouseDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        onCloseDropdown()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)

    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onCloseDropdown])

  function openDropdown() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }

  function closeDropdown() {
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

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      onCloseDropdown()
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
        onSelectEnvironment(activeEnvironment)
      }
    }
  }

  function onTriggerClick() {
    if (isOpen) {
      onCloseDropdown()
      return
    }

    openDropdown()
  }

  return {
    activeIndex,
    activeOptionId,
    closeDropdown,
    isOpen,
    listboxId,
    onTriggerClick,
    onTriggerKeyDown,
    openDropdown,
    setActiveIndex,
    wrapperRef,
  }
}
