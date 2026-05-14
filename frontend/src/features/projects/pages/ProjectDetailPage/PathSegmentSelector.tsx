import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../components/ui/popover'
import { cn } from '../../../../lib/utils'

interface PathSegmentOption {
  label: string
  value: string
}

interface PathSegmentSelectorProps {
  currentLabel: string
  emptyMessage: string
  label: string
  loading?: boolean
  loadingMessage?: string
  onSelect: (value: string) => void
  options: PathSegmentOption[]
  searchPlaceholder: string
  selectedValue?: string
  tone?: 'primary' | 'secondary'
}

export function PathSegmentSelector({
  currentLabel,
  emptyMessage,
  label,
  loading = false,
  loadingMessage = 'Loading…',
  onSelect,
  options,
  searchPlaceholder,
  selectedValue,
  tone = 'primary',
}: PathSegmentSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  function handleSelect(value: string) {
    onSelect(value)
    setOpen(false)
    setSearch('')
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setSearch('')
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-busy={loading}
          className={cn(
            'h-auto cursor-pointer rounded-xl px-3 py-1.5 text-left shadow-none transition-colors hover:bg-muted/40 sm:px-3.5',
            tone === 'primary' &&
              'text-lg font-bold text-foreground hover:text-foreground sm:text-xl',
            tone === 'secondary' &&
              'text-base font-medium text-muted-foreground hover:text-foreground sm:text-lg',
            !loading && 'data-[state=open]:bg-muted/40',
          )}
          size="sm"
          variant="ghost"
        >
          <span className="sr-only">{label}</span>
          <span className="truncate">{currentLabel}</span>
          <ChevronDownIcon
            className={cn(
              'ml-1.5 size-4 shrink-0 transition-transform group-aria-expanded/button:rotate-180 sm:ml-2',
              tone === 'primary' ? 'text-foreground/70' : 'text-muted-foreground',
            )}
            data-icon="inline-end"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-border p-0 ring-0"
      >
        <Command
          className="rounded-none border-0 bg-transparent"
          shouldFilter
          value={search}
        >
          <CommandInput
            aria-label={`Search ${label.toLowerCase()}`}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
            value={search}
          />
          <CommandList>
            {loading ? (
              <div className="px-3 py-6 text-sm text-muted-foreground">
                {loadingMessage}
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      keywords={[option.label]}
                      onSelect={() => handleSelect(option.value)}
                      value={option.label}
                    >
                      <CheckIcon
                        className={cn(
                          'size-4 text-foreground transition-opacity',
                          selectedValue === option.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
