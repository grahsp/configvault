import { ChevronDownIcon } from 'lucide-react'
import { SplitActionButton } from '@/components/composed'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'

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
      <SplitActionButton
        primaryAction={{
          label: '+ Add Secret',
          onClick: onOpenAddSecret,
        }}
        secondaryActions={[
          {
            label: 'Import Secrets',
            onSelect: onOpenImportModal,
          },
        ]}
      />

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
