import { MoreHorizontalIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { cn } from '../../lib/utils'

export interface KebabMenuButtonItem {
  disabled?: boolean
  label: string
  onSelect: () => void
  tone?: 'danger' | 'default'
}

export interface KebabMenuButtonProps {
  className?: string
  disabled?: boolean
  items: KebabMenuButtonItem[]
  label: string
}

export function KebabMenuButton({
  className,
  disabled = false,
  items,
  label,
}: KebabMenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={label}
          className={cn('shrink-0', className)}
          disabled={disabled}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
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
