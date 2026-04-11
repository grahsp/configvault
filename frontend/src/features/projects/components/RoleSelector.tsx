import type { ChangeEvent } from 'react'
import { useId } from 'react'
import { useSetProjectMemberRole } from '../hooks/useProjects'
import type { ProjectRole } from '../types'
import { getErrorMessage } from '../pages/projectPageUtils'
import styles from '../pages/ProjectDetailPage/ProjectDetailPage.module.css'

const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

const roleOptions: ProjectRole[] = ['owner', 'admin', 'member']

interface RoleSelectorProps {
  canEdit: boolean
  displayName: string
  projectId: string
  role: ProjectRole
  userId: string
}

export function RoleSelector({
  canEdit,
  displayName,
  projectId,
  role,
  userId,
}: RoleSelectorProps) {
  const inputId = useId()
  const errorId = useId()
  const setRoleMutation = useSetProjectMemberRole(projectId)

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextRole = event.target.value as ProjectRole

    if (nextRole === role) {
      return
    }

    setRoleMutation.mutate({ role: nextRole, userId })
  }

  return (
    <div className={styles.roleSelectorGroup}>
      <label className={styles.visuallyHidden} htmlFor={inputId}>
        Role for {displayName}
      </label>
      <select
        aria-describedby={setRoleMutation.isError ? errorId : undefined}
        aria-invalid={setRoleMutation.isError ? 'true' : undefined}
        className={styles.roleSelector}
        disabled={!canEdit || setRoleMutation.isPending}
        id={inputId}
        onChange={handleChange}
        value={role}
      >
        {roleOptions.map((roleOption) => (
          <option key={roleOption} value={roleOption}>
            {roleLabels[roleOption]}
          </option>
        ))}
      </select>
      {setRoleMutation.isError ? (
        <p className={styles.inlineError} id={errorId} role="alert">
          {getErrorMessage(
            setRoleMutation.error,
            'Role could not be updated.',
          )}
        </p>
      ) : null}
    </div>
  )
}
