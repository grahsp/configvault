export type ProjectRole = 'owner' | 'admin' | 'member'

export interface ProjectMember {
  userId: string
  displayName?: string | null
  role: ProjectRole
  isCurrentUser: boolean
}
