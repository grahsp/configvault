import { useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx'
import { formatCreatedDate, useDeleteProject } from '../../model'
import { ProjectDeleteDialog } from '../../ui'
import type { ProjectLayoutContext } from './ProjectLayout'
import styles from './ProjectDetailPage.module.css'

export function GeneralPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const deleteProjectMutation = useDeleteProject()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  function openDeleteDialog() {
    deleteProjectMutation.reset()
    setIsDeleteModalOpen(true)
  }

  function closeDeleteDialog() {
    if (deleteProjectMutation.isPending) {
      return
    }

    deleteProjectMutation.reset()
    setIsDeleteModalOpen(false)
  }

  function confirmDeleteProject() {
    if (!projectId) {
      return
    }

    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => navigate('/projects'),
    })
  }

  return (
    <>
      <section className={styles.generalSection} aria-labelledby="general-title">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="general-title">
            General
          </h2>
        </div>

        <div className={styles.generalCard}>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Project name</dt>
              <dd className={styles.infoValue}>{project.name}</dd>
            </div>
            {project.description ? (
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>Description</dt>
                <dd className={styles.infoValue}>{project.description}</dd>
              </div>
            ) : null}
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Created</dt>
              <dd className={styles.infoValue}>
                {formatCreatedDate(project.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        <div className={cx(styles.generalCard, styles.dangerCard)}>
          <div className={styles.dangerHeader}>
            <h3 className={styles.dangerTitle}>Danger zone</h3>
            <p className={styles.dangerCopy}>
              Permanently remove this project and all of its project-scoped data.
            </p>
          </div>
          <div className={styles.dangerActions}>
            <button
              className={cx(styles.button, styles.buttonDanger)}
              onClick={openDeleteDialog}
              type="button"
            >
              Delete project
            </button>
          </div>
        </div>
      </section>

      {isDeleteModalOpen ? (
        <ProjectDeleteDialog
          mutation={deleteProjectMutation}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDeleteProject}
          projectName={project.name}
        />
      ) : null}
    </>
  )
}
