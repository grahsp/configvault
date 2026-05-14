import { ChevronDownIcon, MoreHorizontalIcon } from 'lucide-react'
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
  isCopyingExport: boolean
  onCopyExport: () => Promise<void>
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
}

export function SecretsTableHeaderActions({
  canCopyExport,
  isCopyingExport,
  onCopyExport,
  onOpenAddSecret,
  onOpenImportModal,
}: SecretsTableHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ButtonGroup className="overflow-hidden rounded-lg bg-primary text-primary-foreground">
        <Button className="rounded-lg" onClick={onOpenAddSecret} type="button">
          + Add Secret
        </Button>
        <ButtonGroupSeparator className="my-2 w-px shrink-0 self-stretch bg-primary-foreground/20" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open add secret actions"
              className="h-9 w-9 rounded-lg"
              size="icon"
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
              className="h-9 w-9 rounded-lg"
              disabled={isCopyingExport}
              size="icon"
              type="button"
              variant="ghost"
            >
              <MoreHorizontalIcon />
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
