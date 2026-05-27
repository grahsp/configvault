import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { getErrorMessage } from '../../domain/project.utils.ts'
import {
  getSecretValueRevision,
  getSecretValueRevisions,
  restoreSecretValueRevision,
} from '../api'
import { secretsQueryKeys } from './secretsQueryKeys.ts'

interface UseSecretHistoryOptions {
  environmentName: string
  hasUnsavedChanges: boolean
  isOpen: boolean
  onClose: () => void
  projectId: string
  secretKey: string
  secretRevision: number
  secretId: string | null
}

export function useSecretHistory({
  environmentName,
  hasUnsavedChanges,
  isOpen,
  onClose,
  projectId,
  secretKey,
  secretRevision,
  secretId,
}: UseSecretHistoryOptions) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const [revealedRevisions, setRevealedRevisions] = useState<number[]>([])
  const [revealedValuesByRevision, setRevealedValuesByRevision] = useState<
    Record<number, string>
  >({})
  const [loadingRevisions, setLoadingRevisions] = useState<
    Record<number, boolean>
  >({})
  const [errorsByRevision, setErrorsByRevision] = useState<
    Record<number, string | undefined>
  >({})
  const [pendingRestoreRevision, setPendingRestoreRevision] = useState<
    number | null
  >(null)

  const restoreDisabledReason = hasUnsavedChanges
    ? 'Save or cancel the unsaved secret edits before restoring a revision.'
    : undefined

  const revisionsQuery = useQuery({
    queryKey: secretId
      ? secretsQueryKeys.revisions(projectId, environmentName, secretId)
      : [...secretsQueryKeys.all, 'revisions', 'closed'],
    queryFn: () =>
      getSecretValueRevisions(client, projectId, secretId!, environmentName),
    enabled: Boolean(isOpen && projectId && environmentName && secretId),
  })
  const currentRevision =
    revisionsQuery.data?.find((revision) => revision.isCurrent)?.revision ??
    secretRevision

  const restoreRevisionMutation = useMutation<void, Error, number>({
    mutationFn: (revision) =>
      restoreSecretValueRevision(
        client,
        projectId,
        secretId!,
        environmentName,
        revision,
        currentRevision,
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: secretsQueryKeys.list(projectId, environmentName),
        }),
        secretId
          ? queryClient.invalidateQueries({
              queryKey: secretsQueryKeys.revisions(
                projectId,
                environmentName,
                secretId,
              ),
            })
          : Promise.resolve(),
      ])
      toast.success(`${secretKey} restored`)
      setPendingRestoreRevision(null)
      onClose()
    },
  })
  const resetRestoreRevisionMutation = restoreRevisionMutation.reset

  useEffect(() => {
    setRevealedRevisions([])
    setRevealedValuesByRevision({})
    setLoadingRevisions({})
    setErrorsByRevision({})
    setPendingRestoreRevision(null)
    resetRestoreRevisionMutation()
  }, [
    environmentName,
    isOpen,
    projectId,
    resetRestoreRevisionMutation,
    secretId,
  ])

  const toggleRevision = async (revision: number) => {
    if (!secretId) {
      return
    }

    if (revealedRevisions.includes(revision)) {
      setRevealedRevisions((current) =>
        current.filter((currentRevision) => currentRevision !== revision),
      )
      return
    }

    const hasCachedValue = Object.prototype.hasOwnProperty.call(
      revealedValuesByRevision,
      revision,
    )

    if (hasCachedValue) {
      setErrorsByRevision((current) => ({
        ...current,
        [revision]: undefined,
      }))
      setRevealedRevisions((current) =>
        current.includes(revision) ? current : [...current, revision],
      )
      return
    }

    if (loadingRevisions[revision]) {
      return
    }

    setLoadingRevisions((current) => ({
      ...current,
      [revision]: true,
    }))
    setErrorsByRevision((current) => ({
      ...current,
      [revision]: undefined,
    }))

    try {
      const detail = await getSecretValueRevision(
        client,
        projectId,
        secretId,
        environmentName,
        revision,
      )

      setRevealedValuesByRevision((current) => ({
        ...current,
        [revision]: detail.value,
      }))
      setRevealedRevisions((current) =>
        current.includes(revision) ? current : [...current, revision],
      )
    } catch (error) {
      setErrorsByRevision((current) => ({
        ...current,
        [revision]: getErrorMessage(
          error,
          'Something went wrong while loading this revision.',
        ),
      }))
    } finally {
      setLoadingRevisions((current) => ({
        ...current,
        [revision]: false,
      }))
    }
  }

  const openRestoreConfirmation = (revision: number) => {
    if (restoreDisabledReason) {
      return
    }

    resetRestoreRevisionMutation()
    setPendingRestoreRevision(revision)
  }

  const closeRestoreConfirmation = () => {
    if (restoreRevisionMutation.isPending) {
      return
    }

    resetRestoreRevisionMutation()
    setPendingRestoreRevision(null)
  }

  const confirmRestore = () => {
    if (pendingRestoreRevision === null || restoreDisabledReason) {
      return
    }

    restoreRevisionMutation.mutate(pendingRestoreRevision)
  }

  return {
    closeRestoreConfirmation,
    confirmRestore,
    errorsByRevision,
    loadingRevisions,
    openRestoreConfirmation,
    pendingRestoreRevision,
    revealedRevisions,
    revealedValuesByRevision,
    revisionsQuery,
    restoreDisabledReason,
    restoreError: restoreRevisionMutation.isError
      ? getErrorMessage(
          restoreRevisionMutation.error,
          'Something went wrong while restoring this revision.',
        )
      : undefined,
    restorePending: restoreRevisionMutation.isPending,
    toggleRevision,
  }
}
