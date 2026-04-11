export type UserStatus = 'Pending' | 'Active'

export interface CurrentUser {
  id: string
  email: string
  displayName: string
  status: UserStatus
}
