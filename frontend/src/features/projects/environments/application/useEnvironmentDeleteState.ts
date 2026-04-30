import { useState } from 'react'
import type { Environment } from '../domain'

interface DeleteEnvironmentMutation {
  mutateAsync: (environmentId: string) => Promise<unknown>
}

interface UseEnvironmentDeleteStateOptions {
  deleteEnvironmentMutation: DeleteEnvironmentMutation
  environments: Environment[]
  onDeletedEnvironment: (
    deletedEnvironmentId: string,
    nextEnvironments: Environment[],
  ) => void
}

export function useEnvironmentDeleteState({
  deleteEnvironmentMutation,
  environments,
  onDeletedEnvironment,
}: UseEnvironmentDeleteStateOptions) {
  const [deleteError, setDeleteError] = useState('')
  const [deletingEnvironmentId, setDeletingEnvironmentId] = useState('')
  const [environmentPendingDelete, setEnvironmentPendingDelete] =
    useState<Environment | null>(null)

  function onOpenDeleteDialog(environment: Environment) {
    if (environments.length <= 1) {
      return
    }

    setDeleteError('')
    setEnvironmentPendingDelete(environment)
  }

  function onCancelDelete() {
    if (deletingEnvironmentId) {
      return
    }

    setDeleteError('')
    setEnvironmentPendingDelete(null)
  }

  async function onConfirmDelete() {
    if (
      deletingEnvironmentId ||
      environments.length <= 1 ||
      !environmentPendingDelete
    ) {
      return
    }

    const nextEnvironments = environments.filter(
      (environment) => environment.id !== environmentPendingDelete.id,
    )

    setDeleteError('')
    setDeletingEnvironmentId(environmentPendingDelete.id)

    try {
      await deleteEnvironmentMutation.mutateAsync(environmentPendingDelete.id)
      setEnvironmentPendingDelete(null)
      onDeletedEnvironment(environmentPendingDelete.id, nextEnvironments)
    } catch {
      setDeleteError('Environment could not be deleted.')
    } finally {
      setDeletingEnvironmentId('')
    }
  }

  function resetDeleteState() {
    setDeleteError('')
    setEnvironmentPendingDelete(null)
  }

  return {
    deleteError,
    deletingEnvironmentId,
    environmentPendingDelete,
    onCancelDelete,
    onConfirmDelete,
    onOpenDeleteDialog,
    resetDeleteState,
  }
}
