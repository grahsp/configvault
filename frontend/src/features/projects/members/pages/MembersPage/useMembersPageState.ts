import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { useToast } from '../../../../../shared/components/toast/useToast'
import {
  canRoleManageMembers,
  getMemberDisplayName,
  type ProjectMember,
} from '../../domain'
import { useCreateInvitation } from '../../../invitations/application'
import {
  useAddMember,
  useMembers,
  useRemoveMember,
} from '../../application'
import { getErrorMessage } from '../../../domain'
import type { ProjectLayoutContext } from '../../../pages'

export function useMembersPageState() {
  const { projectId } = useParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const resolvedProjectId = projectId ?? ''
  const membersQuery = useMembers(resolvedProjectId)
  const addMemberMutation = useAddMember(resolvedProjectId)
  const createInvitationMutation = useCreateInvitation(resolvedProjectId)
  const removeMemberMutation = useRemoveMember(resolvedProjectId)
  const { addToast } = useToast()
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<ProjectMember | null>(null)
  const [userId, setUserId] = useState('')
  const [invitationError, setInvitationError] = useState('')
  const [validationError, setValidationError] = useState('')

  const members = membersQuery.data ?? []
  const canManageMembers = canRoleManageMembers(
    project.role ?? project.currentUserRole,
  )
  const addMemberErrorMessage =
    validationError ||
    (addMemberMutation.isError
      ? getErrorMessage(addMemberMutation.error, 'Member could not be added.')
      : '')

  function handleUserIdChange(nextUserId: string) {
    setUserId(nextUserId)

    if (validationError) {
      setValidationError('')
    }
  }

  function handleAddMemberSubmit() {
    const trimmedUserId = userId.trim()

    addMemberMutation.reset()

    if (!trimmedUserId) {
      setValidationError('Enter a user ID.')
      return
    }

    setValidationError('')
    addMemberMutation.mutate(trimmedUserId, {
      onSuccess: () => setUserId(''),
    })
  }

  function openRemoveDialog(member: ProjectMember) {
    removeMemberMutation.reset()
    setMemberPendingRemoval(member)
  }

  function closeRemoveDialog() {
    if (removeMemberMutation.isPending) {
      return
    }

    removeMemberMutation.reset()
    setMemberPendingRemoval(null)
  }

  function confirmRemoveMember() {
    if (!memberPendingRemoval || removeMemberMutation.isPending) {
      return
    }

    removeMemberMutation.mutate(memberPendingRemoval.userId, {
      onSuccess: () => setMemberPendingRemoval(null),
    })
  }

  async function generateInvitation() {
    if (!resolvedProjectId || createInvitationMutation.isPending) {
      return
    }

    createInvitationMutation.reset()
    setInvitationError('')

    try {
      const { token } = await createInvitationMutation.mutateAsync()
      const inviteUrl = new URL(`/invitations/${encodeURIComponent(token)}`, window.location.origin)

      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }

      await navigator.clipboard.writeText(inviteUrl.toString())
      addToast({
        message: 'Invitation URL copied to clipboard.',
        type: 'success',
      })
    } catch (error: unknown) {
      const message =
        error instanceof Error &&
        error.message === 'Clipboard access is unavailable in this browser.'
          ? error.message
          : getErrorMessage(
              error,
              'Invitation URL could not be generated.',
            )

      setInvitationError(message)
      addToast({
        message,
        type: 'error',
      })
    }
  }

  return {
    addMemberErrorMessage,
    addMemberMutation,
    canManageMembers,
    createInvitationMutation,
    closeRemoveDialog,
    confirmRemoveMember,
    generateInvitation,
    invitationError,
    memberPendingRemoval,
    members,
    membersQuery,
    openRemoveDialog,
    projectId: resolvedProjectId,
    removeMemberDialogDisplayName: memberPendingRemoval
      ? getMemberDisplayName(memberPendingRemoval)
      : '',
    removeMemberErrorMessage: removeMemberMutation.isError
      ? getErrorMessage(
          removeMemberMutation.error,
          'Something went wrong while removing this member.',
        )
      : '',
    removeMemberMutation,
    setUserId: handleUserIdChange,
    submitAddMember: handleAddMemberSubmit,
    userId,
  }
}
