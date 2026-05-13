import { type FormEvent, useState } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ApiError } from '../../../api/errors/apiError'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../../../components/ui/field'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
} from '../domain'
import {
  getProjectNameValidationError,
  PROJECT_NAME_MAX_LENGTH,
} from '../domain'
import { getErrorMessage, getValidationMessage } from '../domain'

interface ProjectCreateModalProps {
  mutation: UseMutationResult<
    CreateProjectResponse,
    Error | ApiError,
    CreateProjectRequest
  >
  onClose: () => void
  onProjectDescriptionChange: (description: string) => void
  onProjectNameChange: (name: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  projectDescription: string
  projectName: string
}

export function ProjectCreateModal({
  mutation,
  onClose,
  onProjectDescriptionChange,
  onProjectNameChange,
  onSubmit,
  projectDescription,
  projectName,
}: ProjectCreateModalProps) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const formId = 'create-project-form'
  const projectNameValidationError = getProjectNameValidationError(projectName)
  const serverProjectNameError = getValidationMessage(mutation.error, [
    'name',
    'project.name',
  ])
  const genericErrorMessage =
    mutation.isError && !serverProjectNameError
      ? getErrorMessage(
          mutation.error,
          'Something went wrong while creating the project.',
        )
      : undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setHasAttemptedSubmit(true)

    if (projectNameValidationError) {
      event.preventDefault()
      return
    }

    onSubmit(event)
  }

  const visibleProjectNameError =
    serverProjectNameError ??
    (hasAttemptedSubmit || projectName
      ? projectNameValidationError
      : undefined)

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (mutation.isPending) {
            event.preventDefault()
          }
        }}
        onInteractOutside={(event) => {
          if (mutation.isPending) {
            event.preventDefault()
          }
        }}
        showCloseButton={!mutation.isPending}
      >
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          id={formId}
          noValidate
          onSubmit={handleSubmit}
        >
          <FieldGroup>
            <Field data-invalid={visibleProjectNameError ? true : undefined}>
              <FieldLabel
                className="text-[color:var(--color-text-body-strong)]"
                htmlFor="project-name"
              >
                Project name{' '}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>
              <Input
                autoFocus
                id="project-name"
                aria-describedby={
                  visibleProjectNameError ? 'project-name-error' : undefined
                }
                aria-invalid={Boolean(visibleProjectNameError)}
                className="rounded-xl border-[color:var(--color-border)] bg-[color:var(--color-surface-contrast-subtle)] text-[color:var(--color-text-strong)] placeholder:text-[color:var(--color-text-subtle)]"
                disabled={mutation.isPending}
                maxLength={PROJECT_NAME_MAX_LENGTH}
                onChange={(event) => onProjectNameChange(event.target.value)}
                placeholder="Production secrets"
                type="text"
                value={projectName}
              />
              {visibleProjectNameError ? (
                <FieldDescription
                  className="text-destructive"
                  id="project-name-error"
                  role="alert"
                >
                  {visibleProjectNameError}
                </FieldDescription>
              ) : null}
            </Field>

            <Field>
              <FieldLabel
                className="text-[color:var(--color-text-body-strong)]"
                htmlFor="project-description"
              >
                Description
              </FieldLabel>
              <Textarea
                className="rounded-xl border-[color:var(--color-border)] bg-[color:var(--color-surface-contrast-subtle)] text-[color:var(--color-text-strong)] placeholder:text-[color:var(--color-text-subtle)]"
                disabled={mutation.isPending}
                id="project-description"
                maxLength={400}
                onChange={(event) =>
                  onProjectDescriptionChange(event.target.value)
                }
                placeholder="Optional context for this project"
                rows={4}
                value={projectDescription}
              />
            </Field>
          </FieldGroup>

          {genericErrorMessage ? (
            <p className="m-0 text-sm leading-6 text-destructive" role="alert">
              {genericErrorMessage}
            </p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            className="rounded-[var(--radius-md-lg)] border-[color:var(--color-border)] text-[color:var(--color-text-body-strong)]"
            disabled={mutation.isPending}
            onClick={onClose}
            size="lg"
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-[var(--radius-md-lg)]"
            disabled={mutation.isPending}
            form={formId}
            size="lg"
            type="submit"
            variant="default"
          >
            {mutation.isPending ? 'Creating' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
