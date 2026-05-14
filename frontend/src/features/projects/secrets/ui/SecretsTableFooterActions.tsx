import { Button } from '../../../../components/ui/button'

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
        className="rounded-[var(--radius-md-lg)]"
        disabled={isSaving}
        onClick={() => void onSaveEdit()}
        type="button"
      >
        {isSaving ? 'Saving' : 'Save Changes'}
      </Button>
      <Button
        className="rounded-[var(--radius-md-lg)]"
        disabled={isSaving}
        onClick={onCancelEdit}
        type="button"
        variant="outline"
      >
        Cancel
      </Button>
    </>
  )
}
