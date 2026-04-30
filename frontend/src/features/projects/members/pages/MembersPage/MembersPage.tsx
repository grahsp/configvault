import { Button, StatePanel } from '../../../../../shared/ui'
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
        <StatePanel
          className={styles.sectionState}
          role="status"
          title="Loading members..."
        >
          <p>
            Project access details are being prepared.
          </p>
        </StatePanel>
      ) : null}

      {membersQuery.isError ? (
        <StatePanel
          actions={
            <Button
              onClick={() => membersQuery.refetch()}
              type="button"
              variant="secondary"
            >
              Retry
            </Button>
          }
          className={styles.sectionState}
          role="alert"
          title="Failed to load members."
          tone="error"
        >
          <p>
            {getErrorMessage(
              membersQuery.error,
              'Something went wrong while loading project members.',
            )}
          </p>
        </StatePanel>
      ) : null}

      {!membersQuery.isPending && !membersQuery.isError && members.length === 0 ? (
        <StatePanel className={styles.sectionState} title="No members found.">
          <p>
            Members with project access will appear here.
          </p>
        </StatePanel>
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
