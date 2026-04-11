import { Link } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx'
import type { ProjectDetails } from '../../types'
import { formatCreatedDate, getErrorMessage } from '../projectPageUtils'
import styles from './ProjectDetailPage.module.css'

interface ProjectDetailContentProps {
  error: unknown
  isAuthError: boolean
  isDeletePending: boolean
  isError: boolean
  isNotFound: boolean
  isPending: boolean
  onDeleteProject: () => void
  onRetry: () => void
  project?: ProjectDetails
}

export function ProjectDetailContent({
  error,
  isAuthError,
  isDeletePending,
  isError,
  isNotFound,
  isPending,
  onDeleteProject,
  onRetry,
  project,
}: ProjectDetailContentProps) {
  if (isPending) {
    return (
      <div className={styles.state} role="status">
        <p className={styles.stateTitle}>Loading project</p>
        <p className={styles.stateCopy}>Project details are being prepared.</p>
      </div>
    )
  }

  if (isNotFound) {
    return <ProjectNotFoundState />
  }

  if (isAuthError) {
    return (
      <div className={cx(styles.state, styles.stateError)} role="alert">
        <p className={styles.stateTitle}>Project access denied</p>
        <p className={styles.stateCopy}>
          Your account is not authorized to open this project.
        </p>
        <BackToProjectsLink />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cx(styles.state, styles.stateError)} role="alert">
        <p className={styles.stateTitle}>Project could not load</p>
        <p className={styles.stateCopy}>
          {getErrorMessage(
            error,
            'Something went wrong while loading the project.',
          )}
        </p>
        <button
          className={cx(styles.button, styles.buttonSecondary)}
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!project) {
    return <ProjectNotFoundState />
  }

  return (
    <>
      <div className={cx(styles.cardHeader, styles.detailHeader)}>
        <div>
          <Link className={styles.backLink} to="/projects">
            Back to projects
          </Link>
          <h1 id="project-detail-title">{project.name}</h1>
        </div>

        <div className={styles.actions}>
          <button
            className={cx(styles.button, styles.buttonDanger)}
            disabled={isDeletePending}
            onClick={onDeleteProject}
            type="button"
          >
            Delete project
          </button>
          <p className={styles.meta}>
            Created {formatCreatedDate(project.createdAt)}
          </p>
        </div>
      </div>

      {project.description ? (
        <p className={styles.cardCopy}>{project.description}</p>
      ) : null}

      <div className={styles.placeholder}>
        <p className={styles.placeholderTitle}>Vault content will appear here</p>
        <p className={styles.placeholderCopy}>
          This space is reserved for the entries and controls that will be added
          next.
        </p>
      </div>
    </>
  )
}

export function ProjectNotFoundState() {
  return (
    <div className={styles.state}>
      <p className={styles.stateTitle}>Project not found</p>
      <p className={styles.stateCopy}>
        This project is missing or your account cannot access it.
      </p>
      <BackToProjectsLink />
    </div>
  )
}

function BackToProjectsLink() {
  return (
    <Link className={cx(styles.button, styles.buttonSecondary)} to="/projects">
      Back to projects
    </Link>
  )
}
