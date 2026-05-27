import { ChevronDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '../ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '@/lib/utils.ts'

export interface SplitActionButtonPrimaryAction {
  label: ReactNode
  menuLabel?: string
  onClick: () => void
}

export interface SplitActionButtonSecondaryAction {
  disabled?: boolean
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
}

export interface SplitActionButtonProps {
  className?: string
  disabled?: boolean
  primaryAction: SplitActionButtonPrimaryAction
  secondaryActions: SplitActionButtonSecondaryAction[]
}

export function SplitActionButton({
  className,
  disabled = false,
  primaryAction,
  secondaryActions,
}: SplitActionButtonProps) {
  const menuLabel =
    primaryAction.menuLabel ??
    (typeof primaryAction.label === 'string'
      ? `Open ${primaryAction.label.replace(/^[+]\s*/, '').toLowerCase()} actions`
      : 'Open actions')

  const rounded = 'rounded-md'

  return (
    <ButtonGroup className={cn('overflow-hidden', rounded, className)}>
      <Button disabled={disabled} onClick={primaryAction.onClick} type="button" className={rounded}>
        {primaryAction.label}
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label={menuLabel} disabled={disabled} type="button" className={rounded}>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-0">
          {secondaryActions.map((action) => (
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={action.disabled}
              key={action.label}
              onSelect={action.onSelect}
              variant={action.tone === 'danger' ? 'destructive' : 'default'}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
