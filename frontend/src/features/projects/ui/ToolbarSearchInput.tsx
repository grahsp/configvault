import { SearchIcon } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { cn } from '../../../lib/utils'

interface ToolbarSearchInputProps {
  ariaLabel: string
  inputClassName?: string
  iconClassName?: string
  onChange: (value: string) => void
  placeholder: string
  value: string
  wrapperClassName?: string
}

export function ToolbarSearchInput({
  ariaLabel,
  inputClassName,
  iconClassName,
  onChange,
  placeholder,
  value,
  wrapperClassName,
}: ToolbarSearchInputProps) {
  return (
    <div className={wrapperClassName}>
      <SearchIcon
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
          iconClassName,
        )}
      />
      <Input
        aria-label={ariaLabel}
        className={cn(
          'h-10 rounded-[var(--radius-md-lg)] border-border bg-background pl-10 text-sm placeholder:text-muted-foreground',
          inputClassName,
        )}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  )
}
