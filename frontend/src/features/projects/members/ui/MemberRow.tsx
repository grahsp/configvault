import type { ProjectMember, ProjectRole } from '../domain'
import { ActionMenuButton } from '@/components/composed'
import type { ActionMenuButtonItem } from '@/components/composed'
import { roleLabels } from '../domain'
import {
  ManagementListCell,
  ManagementListRow,
  RowActions,
} from './ManagementList'
import { RoleSelector } from './RoleSelector'

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
  const menuItems: ActionMenuButtonItem[] =
    canManageMembers && !member.isCurrentUser
      ? [
          {
            disabled: isRemovePending || !canRemoveMember,
            label: 'Remove',
            onSelect: () => onRemove(member),
            tone: 'danger',
          },
        ]
      : []

  return (
    <ManagementListRow
      aria-label={
        member.isCurrentUser
          ? `${displayName}You ${roleLabels[member.role]} No actions available`
          : undefined
      }
    >
      <ManagementListCell>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="break-words font-medium text-foreground [overflow-wrap:anywhere]">
            {displayName}
          </span>
        </div>
      </ManagementListCell>
      <ManagementListCell className="text-muted-foreground">
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
      </ManagementListCell>
      <ManagementListCell className="w-px text-right">
        <RowActions>
          {menuItems.length > 0 ? (
            <ActionMenuButton
              items={menuItems}
              label={`Member actions for ${displayName}`}
            />
          ) : null}
        </RowActions>
      </ManagementListCell>
    </ManagementListRow>
  )
}
