import { Button } from '../../../../components/ui/button'
import { ProjectCreateModal, ProjectsContent } from '../../ui'
import { useProjectsPageState } from './useProjectsPageState'

export function ProjectsPage() {
  const { createProject, projects } = useProjectsPageState()

  return (
    <main className="flex flex-col gap-8 pb-8 pt-3 sm:gap-10 sm:pb-10 sm:pt-0">
      <section
        aria-labelledby="projects-title"
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h1
            className="m-0 text-[clamp(2.15rem,5vw,2.95rem)] font-extrabold leading-[0.92] tracking-[-0.02em]"
            id="projects-title"
          >
            Projects
          </h1>
        </div>
        <Button
          className="min-h-[42px] w-full shrink-0 rounded-[var(--radius-md-lg)] md:w-auto"
          onClick={createProject.open}
          size="lg"
          type="button"
          variant="default"
        >
          + New Project
        </Button>
      </section>

      <section
        aria-label="Projects workspace"
        className="flex-1"
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
