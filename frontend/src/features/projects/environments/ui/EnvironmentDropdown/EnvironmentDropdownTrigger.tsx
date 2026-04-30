import type { KeyboardEventHandler } from 'react'
import styles from './EnvironmentDropdown.module.css'

export interface EnvironmentDropdownTriggerProps {
  activeOptionId?: string
  isLoading: boolean
  isOpen: boolean
  listboxId: string
  onClick: () => void
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>
  triggerLabel: string
}

export function EnvironmentDropdownTrigger({
  activeOptionId,
  isLoading,
  isOpen,
  listboxId,
  onClick,
  onKeyDown,
  triggerLabel,
}: EnvironmentDropdownTriggerProps) {
  return (
    <button
      aria-activedescendant={isOpen ? activeOptionId : undefined}
      aria-controls={isOpen ? listboxId : undefined}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={styles.trigger}
      disabled={isLoading}
      onClick={onClick}
      onKeyDown={onKeyDown}
      type="button"
    >
      <span>{triggerLabel}</span>
      <span aria-hidden="true" className={styles.chevron}>
        v
      </span>
    </button>
  )
}
