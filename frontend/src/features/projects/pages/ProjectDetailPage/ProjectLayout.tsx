import { ArrowLeftIcon } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import type { Environment } from '../../environments'
import type { ProjectDetails } from '../../domain'
import { ProjectSubNav } from '../../ui'
import { Button } from '../../../../components/ui/button'
import type { ProjectLayoutContext } from './ProjectDetailPage'
import { ProjectEnvironmentSelect } from './ProjectEnvironmentSelect'

interface ProjectLayoutProps {
  isSecretsRoute: boolean
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange: (environment: Environment | null) => void
  project: ProjectDetails
  selectedEnvironmentId: string
  selectedEnvironmentName: string
}

export function ProjectLayout({
  isSecretsRoute,
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  project,
  selectedEnvironmentId,
  selectedEnvironmentName,
}: ProjectLayoutProps) {
  return (
    <>
      <div className="flex flex-col gap-6 pb-2 sm:gap-7">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              asChild
              className="w-fit rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              size="sm"
              variant="ghost"
            >
              <Link to="/projects">
                <ArrowLeftIcon data-icon="inline-start" />
                Back to projects
              </Link>
            </Button>
            {isSecretsRoute ? (
              <ProjectEnvironmentSelect
                onEnvironmentChange={onEnvironmentChange}
                onSelectedEnvironmentChange={onSelectedEnvironmentChange}
                projectId={project.id}
                selectedEnvironmentId={selectedEnvironmentId}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <h1
              className="m-0 text-[clamp(1.7rem,4vw,2.2rem)] font-extrabold leading-[0.96] tracking-[-0.02em]"
              id="project-detail-title"
            >
              {project.name}
            </h1>
            {project.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {project.description}
              </p>
            ) : null}
          </div>
        </div>

        <ProjectSubNav projectId={project.id} />
      </div>
      <Outlet
        context={{ project, selectedEnvironmentName } satisfies ProjectLayoutContext}
      />
    </>
  )
}
