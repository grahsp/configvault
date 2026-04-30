import type { ProjectMember, ProjectRole } from '../domain'
import { Button } from '../../../../shared/ui'
import { roleLabels } from '../domain'
import { RoleSelector } from './RoleSelector'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface MemberRowProps {
  canManageMembers: boolean
  displayName: string
  errorMessage: string
  isRemovePending: boolean
  isRolePending: boolean
  member: ProjectMember
  onRemove: (member: ProjectMember) => void
  onRoleChange: (role: ProjectRole) => void
}

export function MemberRow({
  canManageMembers,
  displayName,
  errorMessage,
  isRemovePending,
  isRolePending,
  member,
  onRemove,
  onRoleChange,
}: MemberRowProps) {
  const isOwner = member.role === 'owner'
  const canEditRole = canManageMembers && !member.isCurrentUser && !isOwner
  const canRemoveMember = canManageMembers && !member.isCurrentUser && !isOwner

  return (
    <tr>
      <th scope="row">
        <span className={styles.memberName}>{displayName}</span>
        {member.isCurrentUser ? (
          <span className={styles.memberMeta}>You</span>
        ) : null}
      </th>
      <td>
        {member.isCurrentUser ? (
          roleLabels[member.role]
        ) : (
          <RoleSelector
            canEdit={canEditRole}
            displayName={displayName}
            errorMessage={errorMessage}
            isPending={isRolePending}
            onRoleChange={onRoleChange}
            role={member.role}
          />
        )}
      </td>
      <td>
        {member.isCurrentUser ? (
          <span className={styles.memberActionUnavailable}>
            No actions available
          </span>
        ) : (
          <Button
            aria-label={`Remove ${displayName}`}
            className={styles.memberAction}
            disabled={!canRemoveMember || isRemovePending}
            onClick={() => onRemove(member)}
            type="button"
            variant="secondary"
          >
            Remove
          </Button>
        )}
      </td>
    </tr>
  )
}
