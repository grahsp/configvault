import { Button } from '../../../../shared/ui'
import { ProjectCreateModal, ProjectsContent } from '../../ui'
import { useProjectsPageState } from './useProjectsPageState'

export function ProjectsPage() {
  const { createProject, projects } = useProjectsPageState()

  return (
    <main className="flex flex-col gap-6 pb-8 pt-3 sm:gap-7 sm:pb-10 sm:pt-0">
      <section
        aria-labelledby="projects-title"
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-[46rem]">
          <h1
            className="m-0 text-[clamp(2.15rem,5vw,2.95rem)] font-extrabold leading-[0.92] tracking-[-0.02em]"
            id="projects-title"
          >
            Projects
          </h1>
          <p className="mt-5 max-w-[38rem] text-[1rem] leading-[1.65] text-[color:var(--color-text-body-strong)]">
            Organize vaults, environments, and access flows from one shared workspace.
          </p>
        </div>
        <Button
          className="min-h-[42px] w-full shrink-0 md:w-auto"
          onClick={createProject.open}
          type="button"
          variant="primary"
        >
          + New Project
        </Button>
      </section>

      <section
        aria-label="Projects workspace"
        className="flex-1 pt-3 sm:pt-4"
      >
        <ProjectsContent
          error={projects.query.error}
          isError={projects.query.isError}
          isPending={projects.query.isPending}
          onCreateProject={createProject.open}
          onRetry={() => projects.query.refetch()}
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
    </main>
  )
}
