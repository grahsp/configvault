import type { ChangeEvent } from 'react'
import { useId } from 'react'
import type { ProjectRole } from '../model'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

const roleOptions: ProjectRole[] = ['owner', 'admin', 'member']

interface RoleSelectorProps {
  canEdit: boolean
  displayName: string
  errorMessage: string
  isPending: boolean
  onRoleChange: (role: ProjectRole) => void
  role: ProjectRole
}

export function RoleSelector({
  canEdit,
  displayName,
  errorMessage,
  isPending,
  onRoleChange,
  role,
}: RoleSelectorProps) {
  const inputId = useId()
  const errorId = useId()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onRoleChange(event.target.value as ProjectRole)
  }

  return (
    <div className={styles.roleSelectorGroup}>
      <label className={styles.visuallyHidden} htmlFor={inputId}>
        Role for {displayName}
      </label>
      <select
        aria-describedby={errorMessage ? errorId : undefined}
        aria-invalid={errorMessage ? 'true' : undefined}
        className={styles.roleSelector}
        disabled={!canEdit || isPending}
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
      {errorMessage ? (
        <p className={styles.inlineError} id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
