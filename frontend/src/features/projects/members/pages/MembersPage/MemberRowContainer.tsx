import { getErrorMessage } from '../../../model'
import { useSetRole } from '../../application'
import {
  getMemberDisplayName,
  type ProjectMember,
  type ProjectRole,
} from '../../domain'
import { MemberRow } from '../../ui'

interface MemberRowContainerProps {
  canManageMembers: boolean
  isRemovePending: boolean
  member: ProjectMember
  onRemove: (member: ProjectMember) => void
  projectId: string
}

export function MemberRowContainer({
  canManageMembers,
  isRemovePending,
  member,
  onRemove,
  projectId,
}: MemberRowContainerProps) {
  const setRoleMutation = useSetRole(projectId)
  const displayName = getMemberDisplayName(member)

  function handleRoleChange(nextRole: ProjectRole) {
    if (nextRole === member.role) {
      return
    }

    setRoleMutation.mutate({ role: nextRole, userId: member.userId })
  }

  return (
    <MemberRow
      canManageMembers={canManageMembers}
      displayName={displayName}
      errorMessage={
        setRoleMutation.isError
          ? getErrorMessage(setRoleMutation.error, 'Role could not be updated.')
          : ''
      }
      isRemovePending={isRemovePending}
      isRolePending={setRoleMutation.isPending}
      member={member}
      onRemove={onRemove}
      onRoleChange={handleRoleChange}
    />
  )
}
