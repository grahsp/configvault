import { Button } from '../../../../shared/ui'

interface SecretsTableFooterActionsProps {
  isSaving: boolean
  onCancelEdit: () => void
  onSaveEdit: () => Promise<void>
}

export function SecretsTableFooterActions({
  isSaving,
  onCancelEdit,
  onSaveEdit,
}: SecretsTableFooterActionsProps) {
  return (
    <>
      <Button
        disabled={isSaving}
        onClick={() => void onSaveEdit()}
        type="button"
        variant="primary"
      >
        {isSaving ? 'Saving' : 'Save Changes'}
      </Button>
      <Button
        disabled={isSaving}
        onClick={onCancelEdit}
        type="button"
        variant="secondary"
      >
        Cancel
      </Button>
    </>
  )
}
