import { useParams } from 'react-router-dom'
import { cx } from '../../../shared/utils/cx'
import { RoleSelector } from '../components/RoleSelector'
import { useProjectMembers } from '../hooks/useProjects'
import type { ProjectMember, ProjectRole } from '../types'
import { getErrorMessage } from './projectPageUtils'
import styles from './ProjectDetailPage/ProjectDetailPage.module.css'

const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

export function MembersPage() {
  const { projectId } = useParams()
  const membersQuery = useProjectMembers(projectId ?? '')
  const members = membersQuery.data ?? []
  const currentUserRole = members.find((member) => member.isCurrentUser)?.role
  const canManageMembers =
    currentUserRole === 'owner' || currentUserRole === 'admin'

  return (
    <section className={styles.membersSection} aria-labelledby="members-title">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id="members-title">
          Members
        </h2>
      </div>

      {membersQuery.isPending ? (
        <div className={styles.sectionState} role="status">
          <p className={styles.stateTitle}>Loading members</p>
          <p className={styles.stateCopy}>
            Project access details are being prepared.
          </p>
        </div>
      ) : null}

      {membersQuery.isError ? (
        <div
          className={cx(styles.sectionState, styles.stateError)}
          role="alert"
        >
          <p className={styles.stateTitle}>Members could not load</p>
          <p className={styles.stateCopy}>
            {getErrorMessage(
              membersQuery.error,
              'Something went wrong while loading project members.',
            )}
          </p>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            onClick={() => membersQuery.refetch()}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!membersQuery.isPending && !membersQuery.isError && members.length === 0 ? (
        <div className={styles.sectionState}>
          <p className={styles.stateTitle}>No members yet</p>
          <p className={styles.stateCopy}>
            Members with project access will appear here.
          </p>
        </div>
      ) : null}

      {!membersQuery.isPending && !membersQuery.isError && members.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.membersTable}>
            <caption className={styles.visuallyHidden}>
              Project members
            </caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Role</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <MemberRow
                  canManageMembers={canManageMembers}
                  key={member.userId}
                  member={member}
                  projectId={projectId ?? ''}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

function MemberRow({
  canManageMembers,
  member,
  projectId,
}: {
  canManageMembers: boolean
  member: ProjectMember
  projectId: string
}) {
  const displayName = getMemberDisplayName(member)
  const isOwner = member.role === 'owner'

  return (
    <tr>
      <th scope="row">
        <span className={styles.memberName}>{displayName}</span>
        {member.isCurrentUser ? (
          <span className={styles.memberMeta}>You</span>
        ) : null}
      </th>
      <td>
        {isOwner ? (
          roleLabels[member.role]
        ) : (
          <RoleSelector
            canEdit={canManageMembers}
            displayName={displayName}
            projectId={projectId}
            role={member.role}
            userId={member.userId}
          />
        )}
      </td>
      <td>
        {isOwner ? (
          <span className={styles.memberActionUnavailable}>
            No actions available
          </span>
        ) : (
          <button
            className={styles.memberAction}
            disabled
            type="button"
            aria-label={`Manage role for ${displayName}`}
          >
            Manage role
          </button>
        )}
      </td>
    </tr>
  )
}

function getMemberDisplayName(member: ProjectMember) {
  const displayName = member.displayName?.trim()

  if (displayName) {
    return displayName
  }

  return member.userId
}
