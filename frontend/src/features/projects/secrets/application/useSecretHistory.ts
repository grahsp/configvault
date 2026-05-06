import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { getErrorMessage } from '../../domain/project.utils.ts'
import {
  getSecretValueRevision,
  getSecretValueRevisions,
} from '../api'
import { secretsQueryKeys } from './secretsQueryKeys.ts'

interface UseSecretHistoryOptions {
  environmentName: string
  isOpen: boolean
  projectId: string
  secretId: string | null
}

export function useSecretHistory({
  environmentName,
  isOpen,
  projectId,
  secretId,
}: UseSecretHistoryOptions) {
  const client = useAuthenticatedApiClient()
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

  const revisionsQuery = useQuery({
    queryKey: secretId
      ? secretsQueryKeys.revisions(projectId, environmentName, secretId)
      : [...secretsQueryKeys.all, 'revisions', 'closed'],
    queryFn: () =>
      getSecretValueRevisions(client, projectId, secretId!, environmentName),
    enabled: Boolean(isOpen && projectId && environmentName && secretId),
  })

  useEffect(() => {
    setRevealedRevisions([])
    setRevealedValuesByRevision({})
    setLoadingRevisions({})
    setErrorsByRevision({})
  }, [environmentName, isOpen, projectId, secretId])

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

  return {
    errorsByRevision,
    loadingRevisions,
    revealedRevisions,
    revealedValuesByRevision,
    revisionsQuery,
    toggleRevision,
  }
}
