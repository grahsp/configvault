import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

export function useMenuButtonState(
  additionalRefs: RefObject<HTMLElement | null>[] = [],
) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideRoot = rootRef.current?.contains(target) ?? false
      const isInsideAdditionalRef = additionalRefs.some(
        (ref) => ref.current?.contains(target) ?? false,
      )

      if (!isInsideRoot && !isInsideAdditionalRef) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [additionalRefs, isOpen])

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  return {
    closeMenu: () => setIsOpen(false),
    handleTriggerClick: () => setIsOpen((open) => !open),
    handleTriggerKeyDown,
    isOpen,
    menuId,
    rootRef,
  }
}
