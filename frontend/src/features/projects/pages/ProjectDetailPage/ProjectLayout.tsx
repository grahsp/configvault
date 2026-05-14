import type { UseQueryResult } from '@tanstack/react-query'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useProjects } from '../../application/useProjectsQuery'
import type { Environment } from '../../environments'
import type { ProjectDetails } from '../../domain'
import { ProjectSubNav } from '../../ui'
import type { ProjectLayoutContext } from './ProjectDetailPage'
import { PathSegmentSelector } from './PathSegmentSelector'

interface ProjectLayoutProps {
  environments: Environment[]
  environmentsQuery: UseQueryResult<Environment[], Error>
  onEnvironmentChange: (environmentId: string) => void
  project: ProjectDetails
  selectedEnvironmentId: string
  selectedEnvironmentName: string
}

export function ProjectLayout({
  environments,
  environmentsQuery,
  onEnvironmentChange,
  project,
  selectedEnvironmentId,
  selectedEnvironmentName,
}: ProjectLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const projectsQuery = useProjects()
  const projects = projectsQuery.data ?? []
  const activeSection = location.pathname.endsWith('/general')
    ? 'general'
    : location.pathname.endsWith('/members')
      ? 'members'
      : 'secrets'

  const selectedEnvironment =
    environments.find((environment) => environment.id === selectedEnvironmentId) ?? null

  function handleProjectSelect(projectId: string) {
    if (projectId === project.id) {
      return
    }

    navigate({
      pathname: `/projects/${projectId}/${activeSection}`,
      search: location.search,
    })
  }

  const currentEnvironmentLabel =
    selectedEnvironment?.environmentName ||
    selectedEnvironmentName ||
    (environmentsQuery.isPending
      ? 'Loading environment…'
      : environmentsQuery.isError
        ? 'Environments unavailable'
        : 'Select environment')

  return (
    <>
      <div className="flex flex-col gap-3 pb-1 sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="sr-only" id="project-detail-title">
            {project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5">
            <PathSegmentSelector
              currentLabel={project.name}
              emptyMessage="No matching projects."
              label="Project"
              loading={projectsQuery.isPending}
              loadingMessage="Loading projects…"
              onSelect={handleProjectSelect}
              options={projects.map((projectOption) => ({
                label: projectOption.name,
                value: projectOption.id,
              }))}
              searchPlaceholder="Search projects..."
              selectedValue={project.id}
              tone="primary"
            />
            <span aria-hidden className="text-xl font-medium text-muted-foreground sm:text-2xl">
              /
            </span>
            <PathSegmentSelector
              currentLabel={currentEnvironmentLabel}
              emptyMessage="No matching environments."
              label="Environment"
              loading={environmentsQuery.isPending}
              loadingMessage="Loading environments…"
              onSelect={onEnvironmentChange}
              options={environments.map((environment) => ({
                label: environment.environmentName,
                value: environment.id,
              }))}
              searchPlaceholder="Search environments..."
              selectedValue={selectedEnvironment?.id}
              tone="secondary"
            />
          </div>
        </div>

        <ProjectSubNav projectId={project.id} />
      </div>
      <Outlet
        context={{
          hasSelectedEnvironment: Boolean(selectedEnvironmentName),
          isEnvironmentLoading: environmentsQuery.isPending,
          project,
          selectedEnvironmentName,
        } satisfies ProjectLayoutContext}
      />
    </>
  )
}
