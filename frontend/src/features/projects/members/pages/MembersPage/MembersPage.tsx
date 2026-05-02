import { Button, StatePanel } from '../../../../../shared/ui'
import {
  AddMemberForm,
  InvitationLinksTable,
  MembersTable,
  RemoveMemberDialog,
  RevokeInvitationDialog,
} from '../../ui'
import { formatCreatedDate, getErrorMessage } from '../../../domain'
import { useMembersPageState } from './useMembersPageState'
import { MemberRowContainer } from './MemberRowContainer'
import styles from '../../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

export function MembersPage() {
  const {
    addMemberErrorMessage,
    addMemberMutation,
    canManageMembers,
    closeRemoveDialog,
    closeRevokeInvitationDialog,
    confirmRevokeInvitation,
    confirmRemoveMember,
    createInvitationMutation,
    generateInvitation,
    invitationError,
    invitationPendingRevocation,
    invitations,
    invitationsQuery,
    memberPendingRemoval,
    members,
    membersQuery,
    openRemoveDialog,
    openRevokeInvitationDialog,
    projectId,
    revokeInvitationDialogCreatedByName,
    revokeInvitationDialogExpiresAt,
    revokeInvitationErrorMessage,
    revokeInvitationMutation,
    removeMemberDialogDisplayName,
    removeMemberErrorMessage,
    removeMemberMutation,
    setUserId,
    submitAddMember,
    userId,
  } = useMembersPageState()

  return (
    <section className={styles.membersSection} aria-label="Project members">
      <div className={`${styles.contentSection} ${styles.membersContentSection}`}>
        <AddMemberForm
          actions={
            canManageMembers ? (
              <Button
                className={`${styles.memberAction} ${styles.memberActionSquare}`}
                disabled={createInvitationMutation.isPending}
                onClick={generateInvitation}
                type="button"
                variant="secondary"
              >
                {createInvitationMutation.isPending ? 'Inviting...' : 'Invite'}
              </Button>
            ) : null
          }
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
      </div>

      {canManageMembers ? (
        <div className={`${styles.contentSection} ${styles.invitationSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active links</h2>
          </div>

          {invitationError ? (
            <p className={styles.formError} role="alert">
              {invitationError}
            </p>
          ) : null}

          {invitationsQuery.isPending ? (
            <StatePanel
              className={styles.sectionState}
              role="status"
              title="Loading invitation links..."
            >
              <p>
                Active invitation links are being prepared.
              </p>
            </StatePanel>
          ) : null}

          {invitationsQuery.isError ? (
            <StatePanel
              actions={
                <Button
                  onClick={() => invitationsQuery.refetch()}
                  type="button"
                  variant="secondary"
                >
                  Retry
                </Button>
              }
              className={styles.sectionState}
              role="alert"
              title="Failed to load invitation links."
              tone="error"
            >
              <p>
                {getErrorMessage(
                  invitationsQuery.error,
                  'Something went wrong while loading invitation links.',
                )}
              </p>
            </StatePanel>
          ) : null}

          {!invitationsQuery.isPending &&
          !invitationsQuery.isError &&
          invitations.length === 0 ? (
            <StatePanel className={styles.sectionState} title="No active invitation links.">
              <p>
                Generate an invitation URL to grant project access with a link.
              </p>
            </StatePanel>
          ) : null}

          {!invitationsQuery.isPending &&
          !invitationsQuery.isError &&
          invitations.length > 0 ? (
            <InvitationLinksTable>
              {invitations.map((invitation) => (
                <tr key={invitation.invitationId}>
                  <th scope="row">{invitation.createdByName}</th>
                  <td>{formatCreatedDate(invitation.createdAt)}</td>
                  <td>{formatCreatedDate(invitation.expiresAt)}</td>
                  <td>
                    <Button
                      disabled={
                        revokeInvitationMutation.isPending &&
                        invitationPendingRevocation?.invitationId === invitation.invitationId
                      }
                      onClick={() => openRevokeInvitationDialog(invitation)}
                      type="button"
                      variant="danger"
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </InvitationLinksTable>
          ) : null}
        </div>
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

      {invitationPendingRevocation ? (
        <RevokeInvitationDialog
          createdByName={revokeInvitationDialogCreatedByName}
          errorMessage={revokeInvitationErrorMessage}
          expiresAt={formatCreatedDate(revokeInvitationDialogExpiresAt)}
          isPending={revokeInvitationMutation.isPending}
          onCancel={closeRevokeInvitationDialog}
          onConfirm={confirmRevokeInvitation}
        />
      ) : null}
    </section>
  )
}
