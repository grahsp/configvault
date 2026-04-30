import { cx } from '../../../../../shared/utils/cx'
import { AddMemberForm, MembersTable, RemoveMemberDialog } from '../../ui'
import { getErrorMessage } from '../../../domain'
import { useMembersPageState } from './useMembersPageState'
import { MemberRowContainer } from './MemberRowContainer'
import styles from '../../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

export function MembersPage() {
  const {
    addMemberErrorMessage,
    addMemberMutation,
    canManageMembers,
    closeRemoveDialog,
    confirmRemoveMember,
    memberPendingRemoval,
    members,
    membersQuery,
    openRemoveDialog,
    projectId,
    removeMemberDialogDisplayName,
    removeMemberErrorMessage,
    removeMemberMutation,
    setUserId,
    submitAddMember,
    userId,
  } = useMembersPageState()

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
        onSubmit={submitAddMember}
        onUserIdChange={setUserId}
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
        <MembersTable>
          {members.map((member) => (
            <MemberRowContainer
              canManageMembers={canManageMembers}
              isRemovePending={
                removeMemberMutation.isPending &&
                memberPendingRemoval?.userId === member.userId
              }
              key={member.userId}
              member={member}
              onRemove={openRemoveDialog}
              projectId={projectId}
            />
          ))}
        </MembersTable>
      ) : null}

      {memberPendingRemoval ? (
        <RemoveMemberDialog
          displayName={removeMemberDialogDisplayName}
          errorMessage={removeMemberErrorMessage}
          isPending={removeMemberMutation.isPending}
          onCancel={closeRemoveDialog}
          onConfirm={confirmRemoveMember}
        />
      ) : null}
    </section>
  )
}
