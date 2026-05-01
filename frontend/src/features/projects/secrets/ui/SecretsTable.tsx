import type { Secret } from '../domain'
import type { SecretRowViewModel } from '../application'
import { SecretRow } from './SecretRow.tsx'
import styles from './SecretsTable.module.css'

interface SecretsTableProps {
  isSaving: boolean
  rows: SecretRowViewModel[]
  onCancelEdit: () => void
  onDraftKeyChange: (secret: Secret, nextDraftKey: string) => void
  onDraftValueChange: (secret: Secret, nextDraftValue: string) => void
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
  onReveal,
  onSaveEdit,
  onStartValueEdit,
  onToggleDelete,
}: SecretsTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.configItemsTable}>
        <caption className={styles.visuallyHidden}>Project secrets</caption>
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Value</th>
            <th className={styles.actionsColumn} scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
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
              onReveal={onReveal}
              onSaveEdit={() => void onSaveEdit()}
              onStartValueEdit={onStartValueEdit}
              revealedValue={row.revealedValue}
              shouldFocus={row.shouldFocus}
              validationError={row.validationError}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
