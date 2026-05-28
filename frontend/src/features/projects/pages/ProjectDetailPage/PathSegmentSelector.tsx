import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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
            'h-auto min-w-0 max-w-full cursor-pointer items-center justify-start gap-1.5 whitespace-normal rounded-md px-1.5 py-1.5 text-left leading-tight shadow-none transition-colors hover:bg-muted/55 focus-visible:bg-muted/55 has-data-[icon=inline-end]:pr-1.5 sm:px-2 sm:has-data-[icon=inline-end]:pr-2',
            tone === 'primary' &&
              'font-semibold text-primary hover:text-primary',
            tone === 'secondary' &&
              'font-medium text-muted-foreground hover:text-foreground',
            !loading && 'data-[state=open]:bg-muted/55',
          )}
          size="sm"
          variant="ghost"
        >
          <span className="sr-only">{label}</span>
          <span className="min-w-0 break-words text-2xl">{currentLabel}</span>
          <ChevronDownIcon
            className={cn(
              '-mr-1 size-5 shrink-0 self-center transition-transform group-aria-expanded/button:rotate-180',
              tone === 'primary' ? 'text-foreground/65' : 'text-muted-foreground/80',
            )}
            data-icon="inline-end"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[16rem] max-w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-border p-0 ring-0"
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
