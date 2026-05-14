import { useCallback, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { type Environment } from '../../environments'
import { StatePanel } from '../../../../shared/ui'
import {
  getErrorMessage,
  isAuthError,
  isNotFoundError,
  type ProjectDetails,
} from '../../domain'
import { useProject } from '../../application'
import { Button } from '../../../../components/ui/button'
import { ProjectLayout } from './ProjectLayout'

export function ProjectDetailPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projectId } = useParams()
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState('')

  const projectQuery = useProject(projectId ?? '')
  const project = projectQuery.data
  const selectedEnvironmentId = searchParams.get('environmentId') ?? ''
  const isSecretsRoute = location.pathname.endsWith('/secrets')

  const handleSelectedEnvironmentChange = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironmentName(environment?.environmentName ?? '')
    },
    [],
  )

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

  if (!projectId) {
    return (
      <div className="flex flex-col gap-6 pb-8 pt-3 sm:gap-7 sm:pb-10 sm:pt-0">
        <section className="max-w-3xl rounded-2xl border border-border/60 bg-background p-6">
          <StatePanel title="Project not found">
            <p>
              Check the project link or return to your workspace.
            </p>
            <BackToProjectsLink />
          </StatePanel>
        </section>
      </div>
    )
  }

  const isProjectNotFound =
    projectQuery.isError && isNotFoundError(projectQuery.error)
  const isProjectAuthError =
    projectQuery.isError && isAuthError(projectQuery.error)

  return (
    <div className="flex flex-col gap-6 pb-8 pt-3 sm:gap-7 sm:pb-10 sm:pt-0">
      <section aria-labelledby="project-detail-title" className="flex flex-col gap-6">
        {projectQuery.isPending ? (
          <StatePanel role="status" title="Loading project">
            <p>
              Project details are being prepared.
            </p>
          </StatePanel>
        ) : null}

        {isProjectNotFound ? <ProjectNotFoundState /> : null}

        {isProjectAuthError ? (
          <StatePanel role="alert" title="Project access denied" tone="error">
            <p>
              Your account is not authorized to open this project.
            </p>
            <BackToProjectsLink />
          </StatePanel>
        ) : null}

        {projectQuery.isError && !isProjectNotFound && !isProjectAuthError ? (
          <StatePanel
            actions={
              <Button
                onClick={() => projectQuery.refetch()}
                type="button"
                variant="secondary"
              >
                Retry
              </Button>
            }
            role="alert"
            title="Project could not load"
            tone="error"
          >
            <p>
              {getErrorMessage(
                projectQuery.error,
                'Something went wrong while loading the project.',
              )}
            </p>
          </StatePanel>
        ) : null}

        {!projectQuery.isPending && !projectQuery.isError && !project ? (
          <ProjectNotFoundState />
        ) : null}

        {!projectQuery.isPending && !projectQuery.isError && project ? (
          <ProjectLayout
            isSecretsRoute={isSecretsRoute}
            onEnvironmentChange={handleEnvironmentChange}
            onSelectedEnvironmentChange={handleSelectedEnvironmentChange}
            project={project}
            selectedEnvironmentId={selectedEnvironmentId}
            selectedEnvironmentName={selectedEnvironmentName}
          />
        ) : null}
      </section>
    </div>
  )
}

export interface ProjectLayoutContext {
  project: ProjectDetails
  selectedEnvironmentName: string
}

function ProjectNotFoundState() {
  return (
    <StatePanel title="Project not found">
      <p>
        This project is missing or your account cannot access it.
      </p>
      <BackToProjectsLink />
    </StatePanel>
  )
}

function BackToProjectsLink() {
  return (
    <Button asChild className="w-fit rounded-xl" type="button" variant="outline">
      <Link to="/projects">Back to projects</Link>
    </Button>
  )
}
