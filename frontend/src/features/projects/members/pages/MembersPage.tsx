import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx'
import { getErrorMessage } from '../../model'
import {
  useAddMember,
  useMembers,
  useRemoveMember,
  useSetRole,
  type ProjectMember,
  type ProjectRole,
} from '../model'
import { AddMemberForm, RemoveMemberDialog, RoleSelector } from '../ui'
import type { ProjectLayoutContext } from '../../pages'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

const roleLabels: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

export function MembersPage() {
  const { projectId } = useParams()
  const { project } = useOutletContext<ProjectLayoutContext>()
  const resolvedProjectId = projectId ?? ''
  const membersQuery = useMembers(projectId ?? '')
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<ProjectMember | null>(null)
  const [userId, setUserId] = useState('')
  const [validationError, setValidationError] = useState('')
  const members = membersQuery.data ?? []
  const addMemberMutation = useAddMember(resolvedProjectId)
  const removeMemberMutation = useRemoveMember(resolvedProjectId)
  const canManageMembers = canRoleManageMembers(
    project.role ?? project.currentUserRole,
  )
  const addMemberErrorMessage =
    validationError ||
    (addMemberMutation.isError
      ? getErrorMessage(addMemberMutation.error, 'Member could not be added.')
      : '')

  function handleUserIdChange(nextUserId: string) {
    setUserId(nextUserId)

    if (validationError) {
      setValidationError('')
    }
  }

  function handleAddMemberSubmit() {
    const trimmedUserId = userId.trim()

    addMemberMutation.reset()

    if (!trimmedUserId) {
      setValidationError('Enter a user ID.')
      return
    }

    setValidationError('')
    addMemberMutation.mutate(trimmedUserId, {
      onSuccess: () => setUserId(''),
    })
  }

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
        errorMessage={addMemberErrorMessage}
        isPending={addMemberMutation.isPending}
        onSubmit={handleAddMemberSubmit}
        onUserIdChange={handleUserIdChange}
        userId={userId}
      />

      {membersQuery.isPending ? (
        <div className={styles.sectionState} role="status">
          <p className={styles.stateTitle}>Loading members...</p>
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
          <p className={styles.stateTitle}>Failed to load members.</p>
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
          <p className={styles.stateTitle}>No members found.</p>
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
                  projectId={resolvedProjectId}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {memberPendingRemoval ? (
        <RemoveMemberDialog
          displayName={getMemberDisplayName(memberPendingRemoval)}
          errorMessage={
            removeMemberMutation.isError
              ? getErrorMessage(
                  removeMemberMutation.error,
                  'Something went wrong while removing this member.',
                )
              : ''
          }
          isPending={removeMemberMutation.isPending}
          onCancel={closeRemoveDialog}
          onConfirm={confirmRemoveMember}
        />
      ) : null}
    </section>
  )
}

function canRoleManageMembers(role: ProjectRole | undefined) {
  return role === 'owner' || role === 'admin'
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
  const canEditRole = canManageMembers && !member.isCurrentUser && !isOwner
  const canRemoveMember = canManageMembers && !member.isCurrentUser && !isOwner
  const setRoleMutation = useSetRole(projectId)

  function handleRoleChange(nextRole: ProjectRole) {
    if (nextRole === member.role) {
      return
    }

    setRoleMutation.mutate({ role: nextRole, userId: member.userId })
  }

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
            errorMessage={
              setRoleMutation.isError
                ? getErrorMessage(
                    setRoleMutation.error,
                    'Role could not be updated.',
                  )
                : ''
            }
            isPending={setRoleMutation.isPending}
            onRoleChange={handleRoleChange}
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
          <button
            aria-label={`Remove ${displayName}`}
            className={styles.memberAction}
            disabled={!canRemoveMember || isRemovePending}
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

function getMemberDisplayName(member: ProjectMember) {
  const displayName = member.displayName?.trim()

  if (displayName) {
    return displayName
  }

  return member.userId
}
