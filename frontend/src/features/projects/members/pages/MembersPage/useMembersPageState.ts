import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import {
  canRoleManageMembers,
  getMemberDisplayName,
  type ProjectMember,
} from '../../domain'
import {
  useActiveInvitations,
  useRevokeInvitation,
} from '../../../invitations/application'
import type { ActiveInvitation } from '../../../invitations/domain'
import {
  useMembers,
  useRemoveMember,
} from '../../application'
import { getErrorMessage } from '../../../domain'
import type { ProjectLayoutContext } from '../../../pages/ProjectDetailPage/ProjectDetailPage'

export function useMembersPageState() {
  const { projectId } = useParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const resolvedProjectId = projectId ?? ''
  const membersQuery = useMembers(resolvedProjectId)
  const removeMemberMutation = useRemoveMember(resolvedProjectId)
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<ProjectMember | null>(null)
  const [invitationPendingRevocation, setInvitationPendingRevocation] =
    useState<ActiveInvitation | null>(null)

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

  return {
    canManageMembers,
    closeRemoveDialog,
    closeRevokeInvitationDialog,
    confirmRevokeInvitation,
    confirmRemoveMember,
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
  }
}
