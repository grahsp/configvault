import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx'
import { ProjectDeleteDialog } from '../../components/ProjectDeleteDialog'
import {
  useDeleteProject,
  useProject,
} from '../../hooks/useProjects'
import { isAuthError, isNotFoundError } from '../projectPageUtils'
import { ProjectDetailContent } from './ProjectDetailContent'
import styles from './ProjectDetailPage.module.css'

export function ProjectDetailPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const projectQuery = useProject(projectId ?? '')
  const deleteProjectMutation = useDeleteProject()
  const project = projectQuery.data

  function closeDeleteModal() {
    if (deleteProjectMutation.isPending) {
      return
    }

    setIsDeleteModalOpen(false)
    deleteProjectMutation.reset()
  }

  function confirmDeleteProject() {
    if (!projectId) {
      return
    }

    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => navigate('/projects'),
    })
  }

  if (!projectId) {
    return (
      <main className={cx(styles.page, styles.pageTop)}>
        <section
          className={styles.card}
          aria-labelledby="project-not-found-title"
        >
          <div className={styles.state}>
            <p className={styles.stateTitle} id="project-not-found-title">
              Project not found
            </p>
            <p className={styles.stateCopy}>
              Check the project link or return to your workspace.
            </p>
            <Link
              className={cx(styles.button, styles.buttonSecondary)}
              to="/projects"
            >
              Back to projects
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const isProjectNotFound =
    projectQuery.isError && isNotFoundError(projectQuery.error)
  const isProjectAuthError =
    projectQuery.isError && isAuthError(projectQuery.error)

  return (
    <main className={cx(styles.page, styles.pageTop)}>
      <section className={styles.card} aria-labelledby="project-detail-title">
        <ProjectDetailContent
          error={projectQuery.error}
          isAuthError={isProjectAuthError}
          isDeletePending={deleteProjectMutation.isPending}
          isError={projectQuery.isError}
          isNotFound={isProjectNotFound}
          isPending={projectQuery.isPending}
          onDeleteProject={() => {
            deleteProjectMutation.reset()
            setIsDeleteModalOpen(true)
          }}
          onRetry={() => projectQuery.refetch()}
          project={project}
        />
      </section>

      {isDeleteModalOpen && project ? (
        <ProjectDeleteDialog
          errorClassName={styles.formError}
          formActionsClassName={styles.formActions}
          mutation={deleteProjectMutation}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteProject}
          projectName={project.name}
        />
      ) : null}
    </main>
  )
}
