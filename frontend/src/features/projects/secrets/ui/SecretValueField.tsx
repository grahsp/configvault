import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { ActionMenuButton } from '../../../../components/composed'
import { Input } from '../../../../components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from '../../../../components/ui/input-group'
import { cn } from '../../../../lib/utils'
import type { Secret } from '../domain'
import { EyeOffIcon } from './SecretRowIcons.tsx'

interface SecretValueFieldProps {
  secret: Secret
  draftValue: string | null
  displayValue?: string
  hideActionMenu?: boolean
  keepInlineActionsVisibleWhenStatic?: boolean
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isRevealedReadOnly?: boolean
  isSaving: boolean
  isStatic?: boolean
  isValueRevealed: boolean
  onCancelEdit: () => void
  onDeleteToggle: (secret: Secret) => void
  onDraftValueChange: (value: string) => void
  onOpenHistory: (secret: Secret) => void
  onReveal: (secret: Secret) => void
  onSaveEdit: () => void
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  revealedValue?: string
}

const maskedValue = '••••••'
const emptyValue = '(empty)'

export function SecretValueField({
  secret,
  draftValue,
  displayValue,
  hideActionMenu = false,
  keepInlineActionsVisibleWhenStatic = false,
  isMarkedForDeletion,
  isRevealing,
  isRevealedReadOnly = false,
  isSaving,
  isStatic = false,
  isValueRevealed,
  onCancelEdit,
  onDeleteToggle,
  onDraftValueChange,
  onOpenHistory,
  onReveal,
  onSaveEdit,
  onStartValueEdit,
  revealedValue,
}: SecretValueFieldProps) {
  const valueFieldRef = useRef<HTMLInputElement>(null)
  const shouldMoveCaretRef = useRef(false)
  const isStartingValueEditRef = useRef(false)

  useEffect(() => {
    if (!shouldMoveCaretRef.current || draftValue === null) {
      return
    }

    valueFieldRef.current?.focus()
    const cursorPosition = draftValue.length
    valueFieldRef.current?.setSelectionRange(cursorPosition, cursorPosition)
    shouldMoveCaretRef.current = false
  }, [draftValue])

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSaveEdit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onCancelEdit()
    }
  }

  function getDisplayValue() {
    if (displayValue !== undefined) {
      return displayValue
    }

    if (isValueRevealed && revealedValue !== undefined) {
      return revealedValue
    }

    return secret.hasValue ? maskedValue : emptyValue
  }

  function getEditingValue() {
    if (draftValue !== null) {
      return draftValue
    }

    return secret.hasValue ? maskedValue : ''
  }

  function handleValueFieldFocus() {
    if (
      isMarkedForDeletion ||
      isSaving ||
      !secret.hasValue ||
      draftValue !== null ||
      isStartingValueEditRef.current
    ) {
      return
    }

    shouldMoveCaretRef.current = true
    isStartingValueEditRef.current = true
    void Promise.resolve(onStartValueEdit(secret)).finally(() => {
      isStartingValueEditRef.current = false
    })
  }

  function handleDisplayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    action: () => void,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  function handleReveal() {
    if (isSaving || isRevealing || isMarkedForDeletion) {
      return
    }

    onReveal(secret)
  }

  function handleStartEdit() {
    if (isSaving || isMarkedForDeletion || isStartingValueEditRef.current) {
      return
    }

    shouldMoveCaretRef.current = true
    isStartingValueEditRef.current = true
    void Promise.resolve(onStartValueEdit(secret)).finally(() => {
      isStartingValueEditRef.current = false
    })
  }

  const isEditing = draftValue !== null || !secret.hasValue
  const isReadOnlyRevealMode = isStatic && keepInlineActionsVisibleWhenStatic
  const canOpenHistory = secret.hasValue && !isMarkedForDeletion
  const showsHideAction =
    secret.hasValue && (isValueRevealed || draftValue !== null)
  const groupLabel = `Value for ${secret.key}`
  const displayAriaLabel = isRevealedReadOnly
    ? isValueRevealed
      ? groupLabel
      : `Reveal ${secret.key}`
    : isValueRevealed
    ? `Edit value for ${secret.key}`
    : `Reveal ${secret.key}`
  const displayAction =
    isValueRevealed && !isRevealedReadOnly ? handleStartEdit : handleReveal
  const staticFieldValue = getDisplayValue()
  const isDisplayActionDisabled =
    isSaving ||
    isRevealing ||
    isMarkedForDeletion ||
    (isRevealedReadOnly && isValueRevealed)

  function renderActionMenu() {
    if (hideActionMenu) {
      return null
    }

    return (
      <ActionMenuButton
        className={cn(isMarkedForDeletion && 'text-muted-foreground')}
        disabled={isSaving}
        items={[
          ...(secret.hasValue
            ? [
                {
                  disabled: !canOpenHistory,
                  label: 'View history',
                  onSelect: () => onOpenHistory(secret),
                },
              ]
            : []),
          {
            label: isMarkedForDeletion ? 'Undo delete' : 'Delete',
            onSelect: () => onDeleteToggle(secret),
            tone: isMarkedForDeletion ? 'default' : 'danger',
          },
        ]}
        label={`Open actions for ${secret.key}`}
        trigger="input-group"
      />
    )
  }

  function renderInlineActions() {
    return (
      <InputGroupAddon
        align="inline-end"
        className="shrink-0 gap-1 pr-1.5 pl-0"
      >
        {showsHideAction ? (
          <InputGroupButton
            aria-label={`Hide ${secret.key}`}
            className={cn(isMarkedForDeletion && 'text-muted-foreground')}
            disabled={isSaving || isRevealing || isMarkedForDeletion}
            onClick={() => onReveal(secret)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <EyeOffIcon />
          </InputGroupButton>
        ) : null}
        {renderActionMenu()}
      </InputGroupAddon>
    )
  }

  return (
    <InputGroup
      aria-label={groupLabel}
      className={cn(
        "h-9 rounded-lg border-border/60 bg-background shadow-none transition-colors focus-within:ring-2 focus-within:ring-primary/30",
        isStatic && "hover:border-border/60 hover:bg-background",
        !isReadOnlyRevealMode &&
          secret.hasValue &&
          draftValue === null &&
          !isMarkedForDeletion &&
          !isValueRevealed
          ? "cursor-pointer hover:border-border hover:bg-muted/20"
          : null,
        isMarkedForDeletion && "bg-destructive/5 opacity-70",
      )}
      data-disabled={
        (!isReadOnlyRevealMode && isStatic) ||
        isSaving ||
        isMarkedForDeletion ||
        isRevealing
      }
    >
      {isStatic && !isReadOnlyRevealMode ? (
        <Input
          aria-label="Value"
          className={cn(
            "h-full flex-1 rounded-none border-0 bg-transparent px-3 py-0 font-mono text-base leading-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-default disabled:opacity-100",
            isMarkedForDeletion && "line-through",
            !isValueRevealed && secret.hasValue && "text-muted-foreground/80",
          )}
          data-slot="input-group-control"
          disabled
          readOnly
          type="text"
          value={staticFieldValue}
        />
      ) : isEditing && !isReadOnlyRevealMode ? (
        <Input
          aria-label="Value"
          className={cn(
            "h-full flex-1 rounded-none border-0 bg-transparent px-3 py-0 font-mono text-base leading-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            isMarkedForDeletion && "line-through",
          )}
          data-slot="input-group-control"
          disabled={isSaving || isMarkedForDeletion}
          onChange={(event) => onDraftValueChange(event.target.value)}
          onClick={handleValueFieldFocus}
          onFocus={handleValueFieldFocus}
          onKeyDown={handleKeyDown}
          readOnly={isMarkedForDeletion || !isEditing}
          ref={valueFieldRef}
          type="text"
          value={getEditingValue()}
        />
      ) : (
        <button
          aria-label={displayAriaLabel}
          className={cn(
            "group relative flex h-full min-w-0 flex-1 items-center gap-3 px-3 py-0 font-mono text-left outline-none",
            isMarkedForDeletion
              ? "cursor-default"
              : isRevealedReadOnly && isValueRevealed
              ? "cursor-default"
              : isValueRevealed
              ? "cursor-text"
              : "cursor-pointer",
          )}
          disabled={isDisplayActionDisabled}
          onClick={isDisplayActionDisabled ? undefined : displayAction}
          onKeyDown={
            isDisplayActionDisabled
              ? undefined
              : (event) => handleDisplayKeyDown(event, displayAction)
          }
          type="button"
        >
          <span
            className={cn(
              "min-w-0 truncate text-base leading-none transition-opacity",
              isMarkedForDeletion
                ? "text-muted-foreground line-through"
                : isValueRevealed
                ? "text-foreground"
                : "text-muted-foreground/80 group-hover:opacity-0 group-focus-visible:opacity-0",
            )}
          >
            {getDisplayValue()}
          </span>
          {!isValueRevealed && !isMarkedForDeletion ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 right-3 hidden items-center truncate text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:inline-flex"
            >
              Click to reveal
            </span>
          ) : null}
        </button>
      )}
      {!isStatic || isReadOnlyRevealMode ? renderInlineActions() : null}
    </InputGroup>
  )
}
