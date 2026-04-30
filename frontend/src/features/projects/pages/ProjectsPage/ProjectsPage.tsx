import { cx } from '../../../../shared/utils/cx'
import { Button } from '../../../../shared/ui'
import { ProjectCreateModal, ProjectDeleteDialog, ProjectsContent } from '../../ui'
import styles from './ProjectsPage.module.css'
import { useProjectsPageState } from './useProjectsPageState'

export function ProjectsPage() {
  const { createProject, deleteProject, projects } = useProjectsPageState()

  return (
    <main className={cx(styles.page, styles.pageTop)}>
      <section className={styles.card} aria-labelledby="projects-title">
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Workspace</p>
            <h1 id="projects-title">Projects</h1>
          </div>
          <Button
            className={styles.headerAction}
            onClick={createProject.open}
            type="button"
            variant="primary"
          >
            Create project
          </Button>
        </div>

        <ProjectsContent
          error={projects.query.error}
          isDeletePending={deleteProject.mutation.isPending}
          isError={projects.query.isError}
          isPending={projects.query.isPending}
          onCreateProject={createProject.open}
          onRetry={() => projects.query.refetch()}
          onSelectProjectForDelete={deleteProject.onSelect}
          projects={projects.sortedProjects}
        />
      </section>

      {createProject.isOpen ? (
        <ProjectCreateModal
          mutation={createProject.mutation}
          onClose={createProject.onClose}
          onProjectDescriptionChange={createProject.onProjectDescriptionChange}
          onProjectNameChange={createProject.onProjectNameChange}
          onSubmit={createProject.onSubmit}
          projectDescription={createProject.projectDescription}
          projectName={createProject.projectName}
        />
      ) : null}

      {deleteProject.pendingProject ? (
        <ProjectDeleteDialog
          mutation={deleteProject.mutation}
          onCancel={deleteProject.onCancel}
          onConfirm={deleteProject.onConfirm}
          projectName={deleteProject.pendingProject.name}
        />
      ) : null}
    </main>
  )
}
