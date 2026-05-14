import { Button } from '../../../../components/ui/button'
import { cn } from '../../../../lib/utils'
import type { Secret } from '../domain'
import {
  EyeIcon,
  EyeOffIcon,
  HistoryIcon,
  TrashIcon,
  UndoIcon,
} from './SecretRowIcons.tsx'

interface SecretRowActionsProps {
  secret: Secret
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isSaving: boolean
  isValueRevealed: boolean
  onDeleteToggle: (secret: Secret) => void
  onOpenHistory: (secret: Secret) => void
  onReveal: (secret: Secret) => void
}

export function SecretRowActions({
  secret,
  isMarkedForDeletion,
  isRevealing,
  isSaving,
  isValueRevealed,
  onDeleteToggle,
  onOpenHistory,
  onReveal,
}: SecretRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {secret.hasValue ? (
        <Button
          aria-label={`View history for ${secret.key}`}
          className={cn(isMarkedForDeletion && "text-muted-foreground")}
          disabled={isSaving || isMarkedForDeletion}
          size="icon-sm"
          onClick={() => onOpenHistory(secret)}
          type="button"
          variant="ghost"
        >
          <HistoryIcon />
        </Button>
      ) : null}
      {secret.hasValue ? (
        <Button
          aria-label={isValueRevealed ? `Hide ${secret.key}` : `Reveal ${secret.key}`}
          className={cn(isMarkedForDeletion && "text-muted-foreground")}
          disabled={isRevealing}
          size="icon-sm"
          onClick={() => onReveal(secret)}
          type="button"
          variant="ghost"
        >
          {isValueRevealed ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      ) : null}
      <Button
        aria-label={isMarkedForDeletion ? `Undo delete ${secret.key}` : `Delete ${secret.key}`}
        className={cn(
          "text-destructive hover:text-destructive",
          isMarkedForDeletion && "bg-destructive/10",
        )}
        disabled={isSaving}
        size="icon-sm"
        onClick={() => onDeleteToggle(secret)}
        type="button"
        variant="ghost"
      >
        {isMarkedForDeletion ? <UndoIcon /> : <TrashIcon />}
      </Button>
    </div>
  )
}
