import type { FormEvent } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ApiError } from '../../../api/errors/apiError'
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
import styles from '../pages/ProjectsPage/ProjectsPage.module.css'

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
      headerAction={
        <Button
          aria-label="Close create project"
          disabled={mutation.isPending}
          onClick={onClose}
          type="button"
          variant="secondary"
        >
          Close
        </Button>
      }
      title="Create project"
    >
      <form className={styles.projectForm} id={formId} onSubmit={onSubmit}>
        <label className={styles.projectFormField}>
          Project name
          <input
            autoFocus
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
        </label>

        <label className={styles.projectFormField}>
          Description
          <textarea
            disabled={mutation.isPending}
            maxLength={400}
            onChange={(event) =>
              onProjectDescriptionChange(event.target.value)
            }
            placeholder="Optional context for this project"
            rows={4}
            value={projectDescription}
          />
        </label>

        {mutation.isError ? (
          <p
            className={styles.projectFormError}
            id={visibleProjectNameError ? 'project-name-error' : undefined}
            role="alert"
          >
            {serverProjectNameError ??
              getErrorMessage(
                mutation.error,
                'Something went wrong while loading projects.',
              )}
          </p>
        ) : projectNameValidationError && projectName ? (
          <p
            className={styles.projectFormError}
            id="project-name-error"
            role="alert"
          >
            {projectNameValidationError}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}
