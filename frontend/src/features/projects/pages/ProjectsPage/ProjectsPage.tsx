import {
  ArrowDownAZIcon,
  ArrowDownZAIcon,
  CheckIcon,
  ChevronDownIcon,
  Clock3Icon,
  SearchIcon,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'
import { Input } from '../../../../components/ui/input'
import { ProjectCreateModal, ProjectsContent } from '../../ui'
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

const longestSortOption = sortOptions.reduce((longest, option) =>
  option.label.length > longest.label.length ? option : longest,
)

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
  const selectedSortOption = sortOptions.find(
    (option) => option.id === selectedSortOptionId,
  ) ?? sortOptions[2]
  const SelectedSortIcon = selectedSortOption.icon
  const LongestSortIcon = longestSortOption.icon

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
            <div className="relative w-full shrink-0 md:w-[20rem] lg:w-[22rem]">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search projects"
                className="h-10 rounded-[var(--radius-md-lg)] border-border bg-background pl-10 text-sm placeholder:text-muted-foreground"
                onChange={(event) => projects.search.setTerm(event.target.value)}
                placeholder="Search for a project"
                type="search"
                value={projects.search.term}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`Project sort: ${selectedSortOption.label}`}
                  className="min-h-10 w-full justify-between rounded-[var(--radius-md-lg)] px-2.5 sm:inline-grid sm:w-auto sm:grid-cols-[1fr_auto] sm:items-center"
                  size="default"
                  type="button"
                  variant="outline"
                >
                  <span
                    aria-hidden="true"
                    className="invisible hidden items-center gap-2 sm:col-start-1 sm:row-start-1 sm:flex sm:self-center"
                  >
                    <LongestSortIcon data-icon="inline-start" />
                    <span>{longestSortOption.label}</span>
                  </span>
                  <span className="flex min-w-0 items-center gap-2 sm:col-start-1 sm:row-start-1 sm:self-center">
                    <SelectedSortIcon data-icon="inline-start" />
                    <span className="truncate">{selectedSortOption.label}</span>
                  </span>
                  <ChevronDownIcon
                    className="sm:col-start-2 sm:row-start-1 sm:self-center"
                    data-icon="inline-end"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-fit min-w-[14rem] max-w-[calc(100vw-2rem)] rounded-[1rem] p-0"
              >
                <DropdownMenuLabel className="px-4 py-2.5 text-[0.74rem] font-extrabold uppercase tracking-[0.05em] text-muted-foreground">
                  Sort by
                </DropdownMenuLabel>
                <div className="border-t border-border/70 px-2.5 py-1.5">
                  {sortOptions.map((option) => {
                    const OptionIcon = option.icon

                    return (
                      <DropdownMenuItem
                        className="min-h-9 gap-2.5 rounded-lg px-2.5 py-2 text-[0.875rem] [&_svg]:size-3.5"
                        key={option.id}
                        onSelect={() => {
                          projects.sort.setField(option.field)
                          projects.sort.setDirection(option.direction)
                        }}
                      >
                        <OptionIcon />
                        {option.label}
                        {selectedSortOption.id === option.id ? (
                          <CheckIcon className="ml-auto" />
                        ) : null}
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
