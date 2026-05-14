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
    <div aria-label="Project secrets" className="flex flex-col" role="list">
      <div className="flex flex-col gap-1.5">
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
