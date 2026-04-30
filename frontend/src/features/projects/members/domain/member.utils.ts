import type { ProjectMember, ProjectRole } from './member.types'

export const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

export function canRoleManageMembers(role: ProjectRole | undefined) {
  return role === 'owner' || role === 'admin'
}

export function getMemberDisplayName(member: ProjectMember) {
  const displayName = member.displayName?.trim()

  if (displayName) {
    return displayName
  }

  return member.userId
}
