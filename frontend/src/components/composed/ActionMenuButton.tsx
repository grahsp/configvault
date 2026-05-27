import { MoreHorizontalIcon } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { InputGroupButton } from '../ui/input-group'
import { cn } from '@/lib/utils.ts'

export interface ActionMenuButtonItem {
  disabled?: boolean
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
}

export interface ActionMenuButtonProps {
  className?: string
  disabled?: boolean
  items: ActionMenuButtonItem[]
  label: string
  trigger?: 'button' | 'input-group'
}

export function ActionMenuButton({
  className,
  disabled = false,
  items,
  label,
  trigger = 'button',
}: ActionMenuButtonProps) {
  const TriggerButton = trigger === 'input-group' ? InputGroupButton : Button

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <TriggerButton
          aria-label={label}
          className={cn('shrink-0', className)}
          disabled={disabled}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </TriggerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            asChild
            disabled={item.disabled}
            key={item.label}
            onSelect={item.onSelect}
            variant={item.tone === 'danger' ? 'destructive' : 'default'}
          >
            <button disabled={item.disabled} type="button">
              {item.label}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
