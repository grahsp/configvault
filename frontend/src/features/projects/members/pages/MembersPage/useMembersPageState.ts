import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { useToast } from '../../../../../shared/components/toast/useToast'
import {
  canRoleManageMembers,
  getMemberDisplayName,
  type ProjectMember,
} from '../../domain'
import {
  useActiveInvitations,
  useCreateInvitation,
  useRevokeInvitation,
} from '../../../invitations/application'
import type { ActiveInvitation } from '../../../invitations/domain'
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
  const [invitationPendingRevocation, setInvitationPendingRevocation] =
    useState<ActiveInvitation | null>(null)
  const [userId, setUserId] = useState('')
  const [invitationError, setInvitationError] = useState('')
  const [validationError, setValidationError] = useState('')

  const members = membersQuery.data ?? []
  const canManageMembers = canRoleManageMembers(
    project.role ?? project.currentUserRole,
  )
  const invitationsQuery = useActiveInvitations(
    resolvedProjectId,
    canManageMembers,
  )
  const invitations = invitationsQuery.data ?? []
  const revokeInvitationMutation = useRevokeInvitation(resolvedProjectId)
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

  function openRevokeInvitationDialog(invitation: ActiveInvitation) {
    revokeInvitationMutation.reset()
    setInvitationPendingRevocation(invitation)
  }

  function closeRevokeInvitationDialog() {
    if (revokeInvitationMutation.isPending) {
      return
    }

    revokeInvitationMutation.reset()
    setInvitationPendingRevocation(null)
  }

  function confirmRevokeInvitation() {
    if (!invitationPendingRevocation || revokeInvitationMutation.isPending) {
      return
    }

    revokeInvitationMutation.mutate(invitationPendingRevocation.invitationId, {
      onSuccess: () => setInvitationPendingRevocation(null),
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
    closeRevokeInvitationDialog,
    confirmRevokeInvitation,
    confirmRemoveMember,
    generateInvitation,
    invitationError,
    invitationPendingRevocation,
    invitations,
    invitationsQuery,
    memberPendingRemoval,
    members,
    membersQuery,
    openRemoveDialog,
    openRevokeInvitationDialog,
    projectId: resolvedProjectId,
    revokeInvitationDialogCreatedByName: invitationPendingRevocation?.createdByName ?? '',
    revokeInvitationDialogExpiresAt: invitationPendingRevocation?.expiresAt ?? '',
    revokeInvitationErrorMessage: revokeInvitationMutation.isError
      ? getErrorMessage(
          revokeInvitationMutation.error,
          'Something went wrong while revoking this invitation link.',
        )
      : '',
    revokeInvitationMutation,
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
