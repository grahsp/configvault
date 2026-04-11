import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { cx } from '../../../shared/utils/cx'
import { AddMemberForm } from '../components/AddMemberForm'
import { RoleSelector } from '../components/RoleSelector'
import {
  useProjectMembers,
  useRemoveProjectMember,
} from '../hooks/useProjects'
import type { ProjectAccessRole, ProjectMember, ProjectRole } from '../types'
import type { ProjectLayoutContext } from './ProjectLayout'
import { getErrorMessage } from './projectPageUtils'
import styles from './ProjectDetailPage/ProjectDetailPage.module.css'

const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

export function MembersPage() {
  const { projectId } = useParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const membersQuery = useProjectMembers(projectId ?? '')
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<ProjectMember | null>(null)
  const removeMemberMutation = useRemoveProjectMember(projectId ?? '')
  const members = membersQuery.data ?? []
  const canManageMembers = canRoleManageMembers(
    project.role ?? project.currentUserRole,
  )

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

  return (
    <section className={styles.membersSection} aria-labelledby="members-title">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id="members-title">
          Members
        </h2>
      </div>

      <AddMemberForm
        canManageMembers={canManageMembers}
        projectId={projectId ?? ''}
      />

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
                  isRemovePending={
                    removeMemberMutation.isPending &&
                    memberPendingRemoval?.userId === member.userId
                  }
                  key={member.userId}
                  member={member}
                  onRemove={openRemoveDialog}
                  projectId={projectId ?? ''}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {memberPendingRemoval ? (
        <RemoveMemberDialog
          displayName={getMemberDisplayName(memberPendingRemoval)}
          error={removeMemberMutation.error}
          isPending={removeMemberMutation.isPending}
          onCancel={closeRemoveDialog}
          onConfirm={confirmRemoveMember}
        />
      ) : null}
    </section>
  )
}

function canRoleManageMembers(role: ProjectAccessRole | undefined) {
  const normalizedRole = role?.toLowerCase()

  return normalizedRole === 'owner' || normalizedRole === 'admin'
}

function MemberRow({
  canManageMembers,
  isRemovePending,
  member,
  onRemove,
  projectId,
}: {
  canManageMembers: boolean
  isRemovePending: boolean
  member: ProjectMember
  onRemove: (member: ProjectMember) => void
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
            aria-label={`Remove ${displayName}`}
            className={styles.memberAction}
            disabled={!canManageMembers || isRemovePending}
            onClick={() => onRemove(member)}
            type="button"
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  )
}

function RemoveMemberDialog({
  displayName,
  error,
  isPending,
  onCancel,
  onConfirm,
}: {
  displayName: string
  error: Error | null
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="remove-member-title"
        aria-modal="true"
        className={cx(styles.modal, styles.modalCompact)}
        role="dialog"
      >
        <h2 id="remove-member-title">Remove member</h2>
        <p className={styles.modalCopy}>
          Remove this member from the project?
        </p>
        <p className={styles.modalCopy}>{displayName} will lose access.</p>

        {error ? (
          <p className={styles.formError} role="alert">
            {getErrorMessage(
              error,
              'Something went wrong while removing this member.',
            )}
          </p>
        ) : null}

        <div className={styles.formActions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={cx(styles.button, styles.buttonDanger)}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? 'Removing' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getMemberDisplayName(member: ProjectMember) {
  const displayName = member.displayName?.trim()

  if (displayName) {
    return displayName
  }

  return member.userId
}
