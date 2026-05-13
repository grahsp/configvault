import type { FormEvent } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ApiError } from '../../../api/errors/apiError'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../../../components/ui/field'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Button, Modal } from '../../../shared/ui'
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
  const visibleProjectNameError =
    serverProjectNameError ??
    (projectName ? projectNameValidationError : undefined)

  return (
    <Modal
      actions={
        <>
          <Button
            disabled={mutation.isPending}
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending || Boolean(projectNameValidationError)}
            form={formId}
            type="submit"
            variant="primary"
          >
            {mutation.isPending ? 'Creating' : 'Create'}
          </Button>
        </>
      }
      title="Create project"
    >
      <form className="flex flex-col gap-4" id={formId} onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel
              className="text-[color:var(--color-text-body-strong)]"
              htmlFor="project-name"
            >
              Project name
            </FieldLabel>
            <Input
              autoFocus
              id="project-name"
              aria-describedby={
                visibleProjectNameError ? 'project-name-error' : undefined
              }
              aria-invalid={Boolean(visibleProjectNameError)}
              disabled={mutation.isPending}
              maxLength={PROJECT_NAME_MAX_LENGTH}
              onChange={(event) => onProjectNameChange(event.target.value)}
              placeholder="Production secrets"
              required
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
    </Modal>
  )
}
