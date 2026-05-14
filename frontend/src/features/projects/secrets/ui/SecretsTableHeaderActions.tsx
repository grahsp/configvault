import { ChevronDownIcon } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '../../../../components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'

interface SecretsTableHeaderActionsProps {
  canCopyExport: boolean
  compact?: boolean
  isCopyingExport: boolean
  onCopyExport: () => Promise<void>
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
}

export function SecretsTableHeaderActions({
  canCopyExport,
  compact = false,
  isCopyingExport,
  onCopyExport,
  onOpenAddSecret,
  onOpenImportModal,
}: SecretsTableHeaderActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <ButtonGroup className="overflow-hidden rounded-lg bg-primary text-primary-foreground">
        <Button
          className={compact ? 'h-8 rounded-lg px-3 text-sm' : 'rounded-lg'}
          onClick={onOpenAddSecret}
          type="button"
        >
          + Add Secret
        </Button>
        <ButtonGroupSeparator className="my-2 w-px shrink-0 self-stretch bg-primary-foreground/20" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open add secret actions"
              className={compact ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-lg'}
              size={compact ? 'icon-sm' : 'icon'}
              type="button"
              variant="default"
            >
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onOpenImportModal}>
              Import Secrets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      {canCopyExport ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Secret actions"
              className={
                compact
                  ? 'h-8 rounded-lg px-3 text-sm text-foreground shadow-none'
                  : 'h-9 rounded-lg px-3.5 text-sm text-foreground shadow-none'
              }
              disabled={isCopyingExport}
              size={compact ? 'sm' : 'default'}
              type="button"
              variant="ghost"
            >
              <span>Export</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => void onCopyExport()}>
              Copy Secrets (.env)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
