import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StatusPanel } from '@/components/composed'
import type { Environment } from '@/features/projects/environments'
import {
  getErrorMessage,
  isAuthError,
  isNotFoundError,
  type ProjectDetails,
} from '../../domain'
import { useDeleteProject, useProject } from '../../application'
import { Button } from '../../../../components/ui/button'
import { ProjectLayout } from './ProjectLayout'
import { ProjectDeleteDialog } from '../../ui'

export function ProjectDetailPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const deleteProjectMutation = useDeleteProject()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const projectQuery = useProject(projectId ?? '')
  const project = projectQuery.data

  function openDeleteDialog() {
    deleteProjectMutation.reset()
    setIsDeleteDialogOpen(true)
  }

  function closeDeleteDialog() {
    if (deleteProjectMutation.isPending) {
      return
    }

    deleteProjectMutation.reset()
    setIsDeleteDialogOpen(false)
  }

  function confirmDeleteProject() {
    if (!projectId) {
      return
    }

    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => navigate('/projects'),
    })
  }

  if (!projectId) {
    return (
      <div className="flex flex-col gap-6 pb-8 pt-3 sm:gap-7 sm:pb-10 sm:pt-0">
        <section className="max-w-3xl rounded-2xl border border-border/60 bg-background p-6">
          <StatusPanel actions={<BackToProjectsLink />} title="Project not found">
            <p>
              Check the project link or return to your workspace.
            </p>
          </StatusPanel>
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
          <StatusPanel role="status" title="Loading project">
            <p>
              Project details are being prepared.
            </p>
          </StatusPanel>
        ) : null}

        {isProjectNotFound ? <ProjectNotFoundState /> : null}

        {isProjectAuthError ? (
          <StatusPanel
            actions={<BackToProjectsLink />}
            role="alert"
            title="Project access denied"
            tone="error"
          >
            <p>
              Your account is not authorized to open this project.
            </p>
          </StatusPanel>
        ) : null}

        {projectQuery.isError && !isProjectNotFound && !isProjectAuthError ? (
          <StatusPanel
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
          </StatusPanel>
        ) : null}

        {!projectQuery.isPending && !projectQuery.isError && !project ? (
          <ProjectNotFoundState />
        ) : null}

        {!projectQuery.isPending && !projectQuery.isError && project ? (
          <>
            <ProjectLayout
              onOpenProjectDeleteDialog={openDeleteDialog}
              project={project}
            />
            {isDeleteDialogOpen ? (
              <ProjectDeleteDialog
                mutation={deleteProjectMutation}
                onCancel={closeDeleteDialog}
                onConfirm={confirmDeleteProject}
                projectName={project.name}
              />
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  )
}

export interface ProjectLayoutContext {
  isEnvironmentLoading: boolean
  onOpenProjectDeleteDialog: () => void
  project: ProjectDetails
  selectedEnvironment: Environment | null
  selectedEnvironmentName: string
}

function ProjectNotFoundState() {
  return (
    <StatusPanel actions={<BackToProjectsLink />} title="Project not found">
      <p>
        This project is missing or your account cannot access it.
      </p>
    </StatusPanel>
  )
}

function BackToProjectsLink() {
  return (
    <Button asChild className="w-fit rounded-xl" type="button" variant="outline">
      <Link to="/projects">Back to projects</Link>
    </Button>
  )
}
