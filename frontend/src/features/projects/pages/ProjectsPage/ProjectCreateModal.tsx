import type { FormEvent } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ApiError } from '../../../../api/errors/apiError'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
} from '../../types'
import {
  getProjectNameValidationError,
  PROJECT_NAME_MAX_LENGTH,
} from '../../validation/projectValidation'
import {
  cx,
  getErrorMessage,
  getValidationMessage,
} from '../projectPageUtils'
import styles from './ProjectsPage.module.css'

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
  const projectNameValidationError = getProjectNameValidationError(projectName)
  const serverProjectNameError = getValidationMessage(mutation.error, [
    'name',
    'project.name',
  ])
  const visibleProjectNameError =
    serverProjectNameError ??
    (projectName ? projectNameValidationError : undefined)

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="create-project-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <h2 id="create-project-title">Create project</h2>
          <button
            aria-label="Close create project"
            className={styles.modalClose}
            disabled={mutation.isPending}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <form className={styles.projectForm} onSubmit={onSubmit}>
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

          <div className={styles.projectFormActions}>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              disabled={mutation.isPending}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={cx(styles.button, styles.buttonPrimary)}
              disabled={mutation.isPending || Boolean(projectNameValidationError)}
              type="submit"
            >
              {mutation.isPending ? 'Creating' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
