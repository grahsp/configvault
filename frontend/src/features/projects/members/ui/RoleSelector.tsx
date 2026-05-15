import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '../../../../components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../../../../components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../components/ui/popover'
import type { ProjectRole } from '../domain'
import { cn } from '../../../../lib/utils'

const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

const roleOptions: ProjectRole[] = ['owner', 'admin', 'member']

interface RoleSelectorProps {
  canEdit: boolean
  displayName: string
  errorMessage: string
  isPending: boolean
  onRoleChange: (role: ProjectRole) => void
  role: ProjectRole
}

export function RoleSelector({
  canEdit,
  displayName,
  errorMessage,
  isPending,
  onRoleChange,
  role,
}: RoleSelectorProps) {
  const [open, setOpen] = useState(false)
  const errorId = useId()
  const isDisabled = !canEdit || isPending

  function handleSelect(nextRole: ProjectRole) {
    onRoleChange(nextRole)
    setOpen(false)
  }

  return (
    <div className="grid justify-items-start gap-1.5">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-describedby={errorMessage ? errorId : undefined}
            aria-invalid={errorMessage ? 'true' : undefined}
            aria-label={`Role for ${displayName}`}
            className={cn(
              'h-auto min-w-0 justify-start gap-1 rounded-none border-0 bg-transparent px-0 py-0 text-left text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-foreground',
              'disabled:pointer-events-none disabled:opacity-60',
              !isDisabled && 'data-[state=open]:bg-transparent data-[state=open]:text-foreground',
              errorMessage ? 'text-destructive' : null,
            )}
            disabled={isDisabled}
            size="sm"
            type="button"
            variant="ghost"
          >
            <span>{roleLabels[role]}</span>
            <ChevronDownIcon
              className={cn(
                'size-3.5 shrink-0 transition-transform group-aria-expanded/button:rotate-180',
                errorMessage ? 'text-destructive/80' : 'text-muted-foreground',
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-36 overflow-hidden border border-border p-0 ring-0"
        >
          <Command className="rounded-none border-0 bg-transparent">
            <CommandList>
              <CommandGroup>
                {roleOptions.map((roleOption) => (
                  <CommandItem
                    key={roleOption}
                    onSelect={() => handleSelect(roleOption)}
                    value={roleOption}
                  >
                    <CheckIcon
                      className={cn(
                        'size-4 text-foreground transition-opacity',
                        roleOption === role ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span>{roleLabels[roleOption]}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errorMessage ? (
        <p className="m-0 text-sm font-medium text-destructive" id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
