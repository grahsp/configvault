import { type FormEvent, useState } from 'react'
import { Trash2Icon } from 'lucide-react'
import {
  ActionMenuButton,
  type ActionMenuButtonItem,
} from '@/components/composed'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getErrorMessage, type ProjectDetails } from '@/features/projects/domain'
import {
  normalizeEnvironmentName,
  type Environment,
  validateEnvironmentName,
} from '@/features/projects/environments/domain'
import {
  useCreateEnvironment,
  useDeleteEnvironment,
  useEnvironments,
} from '@/features/projects/environments/application'

interface ProjectSettingsEnvironmentsSectionProps {
  project: ProjectDetails
}

export function ProjectSettingsEnvironmentsSection({
  project,
}: ProjectSettingsEnvironmentsSectionProps) {
  const environmentsQuery = useEnvironments(project.id)
  const createEnvironmentMutation = useCreateEnvironment(project.id)
  const deleteEnvironmentMutation = useDeleteEnvironment(project.id)
  const environments = environmentsQuery.data ?? []
  const [environmentName, setEnvironmentName] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [environmentPendingDelete, setEnvironmentPendingDelete] =
    useState<Environment | null>(null)
  const isCreateDisabled =
    createEnvironmentMutation.isPending || environmentsQuery.isPending
  const finalEnvironmentId =
    environments.length === 1 ? environments[0]?.id : undefined
  const deleteDescriptionId = finalEnvironmentId
    ? `environment-${finalEnvironmentId}-delete-description`
    : undefined

  async function handleCreateEnvironment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (createEnvironmentMutation.isPending) {
      return
    }

    const validationError = validateEnvironmentName(
      environmentName,
      environments,
    )

    if (validationError) {
      setCreateError(validationError)
      return
    }

    setCreateError('')

    try {
      await createEnvironmentMutation.mutateAsync(
        normalizeEnvironmentName(environmentName),
      )
      closeCreateDialog()
    } catch (error) {
      setCreateError(
        getErrorMessage(error, 'Environment could not be created.'),
      )
    }
  }

  function handleCreateInputChange(nextName: string) {
    setEnvironmentName(nextName)
    setCreateError('')
    createEnvironmentMutation.reset()
  }

  function openCreateDialog() {
    setCreateError('')
    createEnvironmentMutation.reset()
    setIsCreateDialogOpen(true)
  }

  function closeCreateDialog() {
    if (createEnvironmentMutation.isPending) {
      return
    }

    setEnvironmentName('')
    setCreateError('')
    createEnvironmentMutation.reset()
    setIsCreateDialogOpen(false)
  }

  function requestDeleteEnvironment(environment: Environment) {
    if (environments.length <= 1) {
      return
    }

    setDeleteError('')
    deleteEnvironmentMutation.reset()
    setEnvironmentPendingDelete(environment)
  }

  function cancelDeleteEnvironment() {
    if (deleteEnvironmentMutation.isPending) {
      return
    }

    setDeleteError('')
    setEnvironmentPendingDelete(null)
  }

  async function confirmDeleteEnvironment() {
    if (
      !environmentPendingDelete ||
      environments.length <= 1 ||
      deleteEnvironmentMutation.isPending
    ) {
      return
    }

    setDeleteError('')

    try {
      await deleteEnvironmentMutation.mutateAsync(environmentPendingDelete.id)
      setEnvironmentPendingDelete(null)
    } catch (error) {
      setDeleteError(
        getErrorMessage(error, 'Environment could not be deleted.'),
      )
    }
  }

  return (
    <section
      aria-labelledby="project-environments-title"
      className="rounded-md border border-border/80 bg-card"
    >
      <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h3
            className="text-sm font-semibold text-foreground"
            id="project-environments-title"
          >
            Environments
          </h3>
          <p className="max-w-[58ch] text-sm leading-6 text-muted-foreground">
            Manage the environments used to scope this project&apos;s secrets.
          </p>
        </div>
        <Button
          className="w-fit"
          disabled={environmentsQuery.isPending}
          onClick={openCreateDialog}
          size="sm"
          type="button"
          variant="outline"
        >
          + New
        </Button>
      </div>

      <div className="grid gap-4 p-4">
        <EnvironmentList
          defaultEnvironmentId={project.defaultEnvironmentId}
          deleteDescriptionId={deleteDescriptionId}
          deletingEnvironmentId={
            deleteEnvironmentMutation.isPending
              ? deleteEnvironmentMutation.variables
              : undefined
          }
          environments={environments}
          finalEnvironmentId={finalEnvironmentId}
          hasError={environmentsQuery.isError}
          isLoading={environmentsQuery.isPending}
          onDeleteEnvironment={requestDeleteEnvironment}
        />

        {environmentsQuery.isError ? (
          <div
            className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm leading-6 text-destructive"
            role="alert"
          >
            <p className="m-0">
              {getErrorMessage(
                environmentsQuery.error,
                'Environments could not be loaded.',
              )}
            </p>
            <Button
              className="mt-2"
              onClick={() => void environmentsQuery.refetch()}
              size="sm"
              type="button"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            openCreateDialog()
            return
          }

          closeCreateDialog()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form className="grid gap-4" onSubmit={handleCreateEnvironment}>
            <DialogHeader>
              <DialogTitle>Add environment</DialogTitle>
              <DialogDescription>
                Create a new environment for scoped secrets.
              </DialogDescription>
            </DialogHeader>

            <Field className="gap-1.5">
              <FieldLabel
                className="text-xs font-semibold text-foreground"
                htmlFor="settings-environment-name"
              >
                Environment name
              </FieldLabel>
              <Input
                aria-describedby={
                  createError ? 'settings-environment-name-error' : undefined
                }
                aria-invalid={Boolean(createError)}
                disabled={isCreateDisabled}
                id="settings-environment-name"
                onChange={(event) =>
                  handleCreateInputChange(event.target.value)
                }
                placeholder="qa"
                type="text"
                value={environmentName}
              />
              {createError ? (
                <FieldDescription
                  className="text-destructive"
                  id="settings-environment-name-error"
                  role="alert"
                >
                  {createError}
                </FieldDescription>
              ) : (
                <FieldDescription className="text-muted-foreground">
                  Names are normalized before creation.
                </FieldDescription>
              )}
            </Field>

            <DialogFooter>
              <Button
                disabled={createEnvironmentMutation.isPending}
                onClick={closeCreateDialog}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isCreateDisabled} type="submit">
                {createEnvironmentMutation.isPending
                  ? 'Adding...'
                  : 'Add environment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {environmentPendingDelete ? (
        <DeleteEnvironmentConfirmationDialog
          deleteError={deleteError}
          environment={environmentPendingDelete}
          isPending={deleteEnvironmentMutation.isPending}
          onCancel={cancelDeleteEnvironment}
          onConfirm={confirmDeleteEnvironment}
        />
      ) : null}
    </section>
  )
}

interface EnvironmentListProps {
  defaultEnvironmentId?: string
  deleteDescriptionId?: string
  deletingEnvironmentId?: string
  environments: Environment[]
  finalEnvironmentId?: string
  hasError: boolean
  isLoading: boolean
  onDeleteEnvironment: (environment: Environment) => void
}

function EnvironmentList({
  defaultEnvironmentId,
  deleteDescriptionId,
  deletingEnvironmentId,
  environments,
  finalEnvironmentId,
  hasError,
  isLoading,
  onDeleteEnvironment,
}: EnvironmentListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-2" role="status">
        <EnvironmentSkeletonRow />
        <EnvironmentSkeletonRow />
      </div>
    )
  }

  if (hasError) {
    return null
  }

  if (environments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-3 text-sm leading-6 text-muted-foreground">
        No environments found. Add one to scope this project&apos;s secrets.
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/70">
      {environments.map((environment) => {
        const isFinalEnvironment = environment.id === finalEnvironmentId
        const isDeleting = deletingEnvironmentId === environment.id
        const menuItems: ActionMenuButtonItem[] = [
          {
            disabled: isFinalEnvironment || isDeleting,
            icon: Trash2Icon,
            label: 'Delete',
            onSelect: () => onDeleteEnvironment(environment),
            tone: 'danger',
          },
        ]

        return (
          <div
            className="grid gap-3 px-4 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center"
            key={environment.id}
          >
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="m-0 truncate text-sm font-medium text-foreground">
                  {environment.environmentName}
                </p>
                {environment.id === defaultEnvironmentId ? (
                  <span className="rounded-sm border border-primary/20 bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
                    Default
                  </span>
                ) : null}
              </div>
              {isFinalEnvironment ? (
                <p
                  className="m-0 mt-1 text-xs leading-5 text-muted-foreground"
                  id={deleteDescriptionId}
                >
                  At least one environment is required.
                </p>
              ) : null}
            </div>

            <ActionMenuButton
              items={menuItems}
              label={`Environment actions for ${environment.environmentName}`}
            />
          </div>
        )
      })}
    </div>
  )
}

function EnvironmentSkeletonRow() {
  return (
    <div className="grid gap-2 rounded-md border border-border/70 px-3 py-3">
      <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
      <div className="h-3 w-48 animate-pulse rounded-sm bg-muted/80" />
    </div>
  )
}

interface DeleteEnvironmentConfirmationDialogProps {
  deleteError: string
  environment: Environment
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteEnvironmentConfirmationDialog({
  deleteError,
  environment,
  isPending,
  onCancel,
  onConfirm,
}: DeleteEnvironmentConfirmationDialogProps) {
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete environment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p className="m-0 text-sm leading-6 text-muted-foreground">
              Delete {environment.environmentName}? Secrets scoped to this
              environment will be removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError ? (
          <p className="m-0 text-sm leading-6 text-destructive" role="alert">
            {deleteError}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isPending ? 'Deleting' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
