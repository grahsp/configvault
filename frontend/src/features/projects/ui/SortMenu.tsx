import { CheckIcon, ArrowUpDownIcon, type LucideIcon } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { cn } from '../../../lib/utils'

export interface SortMenuOption<T extends string = string> {
  icon: LucideIcon
  id: T
  label: string
}

interface SortMenuProps<T extends string = string> {
  ariaLabel: string
  buttonClassName?: string
  buttonSize?: 'icon' | 'icon-sm' | 'icon-lg'
  menuLabel?: string
  onSelect: (id: T) => void
  options: SortMenuOption<T>[]
  selectedOptionId: T
}

export function SortMenu<T extends string = string>({
  ariaLabel,
  buttonClassName,
  buttonSize = 'icon-lg',
  menuLabel = 'Sort by',
  onSelect,
  options,
  selectedOptionId,
}: SortMenuProps<T>) {
  const selectedOption = options.find((option) => option.id === selectedOptionId)
  const SelectedIcon = selectedOption?.icon ?? ArrowUpDownIcon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={cn('rounded-[var(--radius-md-lg)]', buttonClassName)}
          size={buttonSize}
          type="button"
          variant="outline"
        >
          <SelectedIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-fit min-w-[14rem] max-w-[calc(100vw-2rem)] rounded-[1rem] p-0"
      >
        <DropdownMenuLabel className="px-4 py-2.5 text-[0.74rem] font-extrabold uppercase tracking-[0.05em] text-muted-foreground">
          {menuLabel}
        </DropdownMenuLabel>
        <div className="border-t border-border/70 px-2.5 py-1.5">
          {options.map((option) => {
            const OptionIcon = option.icon

            return (
              <DropdownMenuItem
                className="min-h-9 gap-2.5 rounded-lg px-2.5 py-2 text-[0.875rem] [&_svg]:size-3.5"
                key={option.id}
                onSelect={() => onSelect(option.id)}
              >
                <OptionIcon />
                {option.label}
                {selectedOptionId === option.id ? (
                  <CheckIcon className="ml-auto" />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
