import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import {
  canRoleManageMembers,
  getMemberDisplayName,
  type ProjectMember,
} from '../../domain'
import {
  useAddMember,
  useMembers,
  useRemoveMember,
} from '../../application'
import { getErrorMessage } from '../../../model'
import type { ProjectLayoutContext } from '../../../pages/ProjectDetailPage'

export function useMembersPageState() {
  const { projectId } = useParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const resolvedProjectId = projectId ?? ''
  const membersQuery = useMembers(resolvedProjectId)
  const addMemberMutation = useAddMember(resolvedProjectId)
  const removeMemberMutation = useRemoveMember(resolvedProjectId)
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<ProjectMember | null>(null)
  const [userId, setUserId] = useState('')
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

  return {
    addMemberErrorMessage,
    addMemberMutation,
    canManageMembers,
    closeRemoveDialog,
    confirmRemoveMember,
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
