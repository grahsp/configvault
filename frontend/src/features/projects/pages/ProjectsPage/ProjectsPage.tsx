import {
  ArrowDownAZIcon,
  ArrowDownZAIcon,
  Clock3Icon,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import {
  ProjectCreateModal,
  ProjectsContent,
  SortMenu,
  ToolbarSearchInput,
} from '../../ui'
import { useProjectsPageState } from './useProjectsPageState'

type SortOptionId = 'name-asc' | 'name-desc' | 'createdAt-asc' | 'createdAt-desc'

const sortOptions: {
  field: 'name' | 'createdAt'
  icon: LucideIcon
  id: SortOptionId
  label: string
  direction: 'asc' | 'desc'
}[] = [
  {
    direction: 'asc',
    field: 'name',
    icon: ArrowDownAZIcon,
    id: 'name-asc',
    label: 'Ascending (A-Z)',
  },
  {
    direction: 'desc',
    field: 'name',
    icon: ArrowDownZAIcon,
    id: 'name-desc',
    label: 'Descending (Z-A)',
  },
  {
    direction: 'desc',
    field: 'createdAt',
    icon: Clock3Icon,
    id: 'createdAt-desc',
    label: 'Newest to Oldest',
  },
  {
    direction: 'asc',
    field: 'createdAt',
    icon: Clock3Icon,
    id: 'createdAt-asc',
    label: 'Oldest to Newest',
  },
]

export function ProjectsPage() {
  const { createProject, projects } = useProjectsPageState()
  const selectedSortOptionId: SortOptionId =
    projects.sort.field === 'name'
      ? projects.sort.direction === 'asc'
        ? 'name-asc'
        : 'name-desc'
      : projects.sort.direction === 'asc'
        ? 'createdAt-asc'
        : 'createdAt-desc'

  return (
    <main className="flex flex-col gap-3 pb-8 pt-3 sm:gap-4 sm:pb-10 sm:pt-0">
      <section
        aria-labelledby="projects-title"
        className="flex flex-col gap-8"
      >
        <div>
          <h1
            className="m-0 text-[clamp(1.7rem,4vw,2.3rem)] font-extrabold leading-[0.96] tracking-[-0.02em]"
            id="projects-title"
          >
            Projects
          </h1>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <ToolbarSearchInput
              ariaLabel="Search projects"
              onChange={projects.search.setTerm}
              placeholder="Search for a project"
              value={projects.search.term}
              wrapperClassName="relative w-full shrink-0 md:w-[20rem] lg:w-[22rem]"
            />
            <SortMenu
              ariaLabel={`Project sort: ${
                sortOptions.find((option) => option.id === selectedSortOptionId)?.label ?? 'Newest to Oldest'
              }`}
              onSelect={(optionId) => {
                const option = sortOptions.find((candidate) => candidate.id === optionId)

                if (!option) {
                  return
                }

                projects.sort.setField(option.field)
                projects.sort.setDirection(option.direction)
              }}
              options={sortOptions}
              selectedOptionId={selectedSortOptionId}
            />
          </div>
          <Button
            className="min-h-[42px] w-full shrink-0 rounded-[var(--radius-md-lg)] md:w-auto md:self-start"
            onClick={createProject.open}
            size="lg"
            type="button"
            variant="default"
          >
            + New Project
          </Button>
        </div>
      </section>

      <section
        aria-label="Projects workspace"
        className="flex-1"
      >
        <ProjectsContent
          error={projects.query.error}
          hasActiveSearch={Boolean(projects.search.term.trim())}
          isError={projects.query.isError}
          isPending={projects.query.isPending}
          onCreateProject={createProject.open}
          onRetry={() => projects.query.refetch()}
          projects={projects.filteredProjects}
          searchTerm={projects.search.term}
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
