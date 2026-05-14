import type { Secret } from '../domain'
import type { SecretRowViewModel } from '../application'
import { SecretRow } from './SecretRow.tsx'

interface SecretsTableProps {
  isSaving: boolean
  rows: SecretRowViewModel[]
  onCancelEdit: () => void
  onDraftKeyChange: (secret: Secret, nextDraftKey: string) => void
  onDraftValueChange: (secret: Secret, nextDraftValue: string) => void
  onOpenHistory: (secret: Secret) => void
  onReveal: (secret: Secret) => Promise<void>
  onSaveEdit: () => Promise<void>
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  onToggleDelete: (secret: Secret) => void
}

export function SecretsTable({
  isSaving,
  rows,
  onCancelEdit,
  onDraftKeyChange,
  onDraftValueChange,
  onOpenHistory,
  onReveal,
  onSaveEdit,
  onStartValueEdit,
  onToggleDelete,
}: SecretsTableProps) {
  return (
    <div aria-label="Project secrets" className="flex flex-col" role="table">
      <div className="hidden border-b border-border/40 pb-3 md:block" role="rowgroup">
        <div
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-4"
          role="row"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground" role="columnheader">
            Key
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground" role="columnheader">
            Value
          </span>
          <span className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground" role="columnheader">
            Actions
          </span>
        </div>
      </div>

      <div className="-mx-3 flex flex-col" role="rowgroup">
        {rows.map((row) => (
          <SecretRow
            secret={row.secret}
            draftKey={row.draftKey}
            draftValue={row.draftValue}
            isMarkedForDeletion={row.isMarkedForDeletion}
            isRevealing={row.isRevealing}
            isSaving={isSaving}
            isValueRevealed={row.isValueRevealed}
            key={row.secret.id}
            onCancelEdit={onCancelEdit}
            onDeleteToggle={onToggleDelete}
            onDraftKeyChange={(nextDraftKey) =>
              onDraftKeyChange(row.secret, nextDraftKey)
            }
            onDraftValueChange={(nextDraftValue) =>
              onDraftValueChange(row.secret, nextDraftValue)
            }
            onOpenHistory={onOpenHistory}
            onReveal={onReveal}
            onSaveEdit={() => void onSaveEdit()}
            onStartValueEdit={onStartValueEdit}
            revealedValue={row.revealedValue}
            shouldFocus={row.shouldFocus}
            validationError={row.validationError}
          />
        ))}
      </div>
    </div>
  )
}
