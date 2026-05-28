import { useEffect, useMemo } from 'react'
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom'
import type { ProjectLayoutContext } from '../../pages'
import { useProjects } from '../../application'
import type { Environment } from '../../environments'
import { useEnvironments } from '../../environments/application'
import { PathSegmentSelector } from '../../pages/ProjectDetailPage/PathSegmentSelector'
import { SecretsSection } from './SecretsSection.tsx'

const EMPTY_ENVIRONMENTS: Environment[] = []

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

export function SecretsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const projectsQuery = useProjects()
  const projects = projectsQuery.data ?? []
  const environmentsQuery = useEnvironments(project.id)
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
  const selectedEnvironmentName = resolvedEnvironment?.environmentName ?? ''
  const selectedEnvironmentValue = resolvedEnvironment?.id ?? ''

  useEffect(() => {
    if (environmentsQuery.isPending || environmentsQuery.isError) {
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
  ])

  function handleProjectSelect(projectId: string) {
    if (projectId === project.id) {
      return
    }

    navigate({
      pathname: `/projects/${projectId}/secrets`,
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

  const currentEnvironmentLabel =
    resolvedEnvironment?.environmentName ||
    (environmentsQuery.isPending
      ? 'Loading environment…'
      : environmentsQuery.isError
        ? 'Environments unavailable'
        : 'Select environment')

  return (
    <section className="flex flex-col gap-5 pt-2 sm:pt-2.5">
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
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
        <span
          aria-hidden="true"
          className="text-xl font-medium text-muted-foreground sm:text-2xl"
        >
          /
        </span>
        <PathSegmentSelector
          currentLabel={currentEnvironmentLabel}
          emptyMessage="No matching environments."
          label="Environment"
          loading={environmentsQuery.isPending}
          loadingMessage="Loading environments…"
          onSelect={handleEnvironmentChange}
          options={environments.map((environment) => ({
            label: environment.environmentName,
            value: environment.id,
          }))}
          searchPlaceholder="Search environments..."
          selectedValue={selectedEnvironmentValue}
          tone="secondary"
        />
      </div>
      <SecretsSection
        environmentName={selectedEnvironmentName}
        isEnvironmentLoading={environmentsQuery.isPending}
        projectId={project.id}
        projectName={project.name}
      />
    </section>
  )
}
