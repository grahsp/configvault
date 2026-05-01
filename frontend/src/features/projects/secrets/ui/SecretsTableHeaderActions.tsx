import { KebabMenuButton, SplitButton } from '../../../../shared/ui'

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
    <>
      <SplitButton
        actionLabel="+ Add Secret"
        menuActionLabel="Import Secrets"
        menuLabel="Open secret actions"
        onActionClick={onOpenAddSecret}
        onMenuActionClick={onOpenImportModal}
        variant="primary"
      />
      {canCopyExport ? (
        <KebabMenuButton
          disabled={isCopyingExport}
          items={[
            {
              label: 'Copy Secrets (.env)',
              onSelect: () => void onCopyExport(),
            },
          ]}
          label="Secret actions"
        />
      ) : null}
    </>
  )
}
