import { CopyIcon } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils.ts'

export interface CopyableInputProps {
  ariaLabel: string
  buttonDisabled?: boolean
  buttonLabel?: string
  className?: string
  disabled?: boolean
  onCopy: () => void
  value: string
}

export function CopyableInput({
  ariaLabel,
  buttonDisabled = false,
  buttonLabel = 'Copy',
  className,
  disabled = false,
  onCopy,
  value,
}: CopyableInputProps) {
  return (
    <InputGroup
      className={cn('h-10 rounded-[var(--radius-md-lg)] border-border bg-background', className)}
      data-disabled={disabled || buttonDisabled}
    >
      <InputGroupInput
        aria-label={ariaLabel}
        disabled={disabled}
        readOnly
        value={value}
      />
      <InputGroupAddon
        align="inline-end"
        className="shrink-0 gap-1 pr-1.5 pl-0"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={buttonLabel}
                className="rounded-full"
                disabled={disabled || buttonDisabled}
                onClick={onCopy}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <CopyIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>{buttonLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </InputGroupAddon>
    </InputGroup>
  )
}
