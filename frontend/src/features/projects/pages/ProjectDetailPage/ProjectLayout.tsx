import { useEffect, useMemo } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useProjects } from '@/features/projects/application'
import type { ProjectDetails } from '@/features/projects/domain'
import type { Environment } from '@/features/projects/environments'
import { useEnvironments } from '@/features/projects/environments/application'
import { PathSegmentSelector } from '@/features/projects/pages/ProjectDetailPage/PathSegmentSelector'
import type { ProjectLayoutContext } from '@/features/projects/pages/ProjectDetailPage/ProjectDetailPage'

const EMPTY_ENVIRONMENTS: Environment[] = []

const projectPageLabels: Record<string, string> = {
  members: 'Members',
  settings: 'Settings',
}

interface ProjectLayoutProps {
  onOpenProjectDeleteDialog: () => void
  project: ProjectDetails
}

export function ProjectLayout({
  onOpenProjectDeleteDialog,
  project,
}: ProjectLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const usesEnvironment = /\/projects\/[^/]+\/secrets\/?$/.test(location.pathname)
  const pageLabel = getProjectPageLabel(location.pathname)
  const projectsQuery = useProjects()
  const projects = projectsQuery.data ?? []
  const environmentsQuery = useEnvironments(project.id, usesEnvironment)
  const environments = environmentsQuery.data ?? EMPTY_ENVIRONMENTS
  const selectedEnvironmentId = searchParams.get('environmentId') ?? ''
  const resolvedEnvironment = useMemo(
    () =>
      resolveEnvironment(
        environments,
        selectedEnvironmentId,
        project.defaultEnvironmentId,
      ),
    [environments, project.defaultEnvironmentId, selectedEnvironmentId],
  )
  const selectedEnvironmentValue = resolvedEnvironment?.id ?? ''
  const selectedEnvironmentName = resolvedEnvironment?.environmentName ?? ''
  const currentEnvironmentLabel =
    resolvedEnvironment?.environmentName ||
    (environmentsQuery.isPending
      ? 'Loading environment...'
      : environmentsQuery.isError
        ? 'Environments unavailable'
        : 'Select environment')

  useEffect(() => {
    if (!usesEnvironment || environmentsQuery.isPending || environmentsQuery.isError) {
      return
    }

    if (selectedEnvironmentId === selectedEnvironmentValue) {
      return
    }

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (selectedEnvironmentValue) {
        nextParams.set('environmentId', selectedEnvironmentValue)
      } else {
        nextParams.delete('environmentId')
      }

      return nextParams
    }, { replace: true })
  }, [
    environmentsQuery.isError,
    environmentsQuery.isPending,
    selectedEnvironmentId,
    selectedEnvironmentValue,
    setSearchParams,
    usesEnvironment,
  ])

  function handleProjectSelect(projectId: string) {
    if (projectId === project.id) {
      return
    }

    navigate({
      pathname: location.pathname.replace(
        `/projects/${project.id}`,
        `/projects/${projectId}`,
      ),
      search: location.search,
    })
  }

  function handleEnvironmentChange(environmentId: string) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (environmentId) {
        nextParams.set('environmentId', environmentId)
      } else {
        nextParams.delete('environmentId')
      }

      return nextParams
    })
  }

  return (
    <>
      <div className="mb-6 flex min-w-0 flex-wrap items-baseline gap-x-0.5 gap-y-2">
        <h1 className="sr-only" id="project-detail-title">
          {project.name}
        </h1>
        <PathSegmentSelector
          currentLabel={project.name}
          emptyMessage="No matching projects."
          label="Project"
          loading={projectsQuery.isPending}
          loadingMessage="Loading projects..."
          onSelect={handleProjectSelect}
          options={projects.map((projectOption) => ({
            label: projectOption.name,
            value: projectOption.id,
          }))}
          searchPlaceholder="Search projects..."
          selectedValue={project.id}
          tone="primary"
        />
        <span
          aria-hidden="true"
          className="text-2xl font-medium leading-none text-muted-foreground/55"
        >
          /
        </span>
        {usesEnvironment ? (
          <PathSegmentSelector
            currentLabel={currentEnvironmentLabel}
            emptyMessage="No matching environments."
            label="Environment"
            loading={environmentsQuery.isPending}
            loadingMessage="Loading environments..."
            onSelect={handleEnvironmentChange}
            options={environments.map((environment) => ({
              label: environment.environmentName,
              value: environment.id,
            }))}
            searchPlaceholder="Search environments..."
            selectedValue={selectedEnvironmentValue}
            tone="secondary"
          />
        ) : (
          <span
            aria-label="Project page"
            className="inline-flex min-w-0 items-baseline px-1.5 text-2xl font-medium leading-tight text-muted-foreground sm:px-2"
          >
            <span className="break-words">{pageLabel}</span>
          </span>
        )}
      </div>
      <Outlet
        context={{
          isEnvironmentLoading: environmentsQuery.isPending,
          onOpenProjectDeleteDialog,
          project,
          selectedEnvironment: resolvedEnvironment,
          selectedEnvironmentName,
        } satisfies ProjectLayoutContext}
      />
    </>
  )
}

function getProjectPageLabel(pathname: string) {
  const pageSegment = /^\/projects\/[^/]+\/([^/]+)/.exec(pathname)?.[1] ?? ''

  return projectPageLabels[pageSegment] ?? 'Project'
}

function resolveEnvironment(
  environments: Environment[],
  selectedEnvironmentId: string,
  defaultEnvironmentId?: string,
) {
  if (selectedEnvironmentId) {
    const selectedEnvironment = environments.find(
      (environment) => environment.id === selectedEnvironmentId,
    )

    if (selectedEnvironment) {
      return selectedEnvironment
    }
  }

  if (defaultEnvironmentId) {
    const defaultEnvironment = environments.find(
      (environment) => environment.id === defaultEnvironmentId,
    )

    if (defaultEnvironment) {
      return defaultEnvironment
    }
  }

  return environments[0] ?? null
}
