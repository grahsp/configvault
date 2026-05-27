import type { KeyboardEventHandler } from 'react'
import { ChevronDownIcon } from 'lucide-react'

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
      className="inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isLoading}
      onClick={onClick}
      onKeyDown={onKeyDown}
      type="button"
    >
      <span className="min-w-0 truncate">{triggerLabel}</span>
      <ChevronDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
    </button>
  )
}
