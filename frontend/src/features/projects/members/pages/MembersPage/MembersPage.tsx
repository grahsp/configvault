import { Button } from '@/components/ui/button.tsx'
import { StatusPanel } from '@/components/composed'
import {
  InviteMemberDialog,
  ManagementList,
  ManagementListBody,
  ManagementListHeader,
  ManagementListHeaderCell,
  RemoveMemberDialog,
  RevokeInvitationDialog,
  PendingInvitesSection,
  SectionHeader,
} from '../../ui'
import { formatCreatedDate, getErrorMessage } from '../../../domain'
import { MemberRowContainer } from './MemberRowContainer'
import { useMembersPageState } from './useMembersPageState'

export function MembersPage() {
  const {
    canManageMembers,
    closeRemoveDialog,
    closeRevokeInvitationDialog,
    confirmRevokeInvitation,
    confirmRemoveMember,
    invitationPendingRevocation,
    invitations,
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
  } = useMembersPageState()

  return (
    <section aria-label="Project members" className="mt-4 grid gap-8">
      <div className="grid gap-3">
        <SectionHeader
          actions={canManageMembers ? <InviteMemberDialog projectId={projectId} /> : undefined}
          title={
            <h2 className="m-0 text-lg font-semibold tracking-tight text-foreground">
              Members ({members.length})
            </h2>
          }
        />

        {membersQuery.isPending ? (
          <StatusPanel
            className="min-h-[var(--panel-min-height)]"
            role="status"
            title="Loading members..."
          >
            <p>Project access details are being prepared.</p>
          </StatusPanel>
        ) : null}

        {membersQuery.isError ? (
          <StatusPanel
            actions={
              <Button
                onClick={() => membersQuery.refetch()}
                type="button"
                variant="outline"
              >
                Retry
              </Button>
            }
            className="min-h-[var(--panel-min-height)]"
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
          </StatusPanel>
        ) : null}

        {!membersQuery.isPending && !membersQuery.isError && members.length === 0 ? (
          <StatusPanel
            className="min-h-[var(--panel-min-height)]"
            title="No members found."
          >
            <p>Members with project access will appear here.</p>
          </StatusPanel>
        ) : null}

        {!membersQuery.isPending && !membersQuery.isError && members.length > 0 ? (
          <ManagementList caption="Project members">
            <ManagementListHeader>
              <ManagementListHeaderCell>Name</ManagementListHeaderCell>
              <ManagementListHeaderCell>Role</ManagementListHeaderCell>
              <ManagementListHeaderCell className="w-px text-right">
                Actions
              </ManagementListHeaderCell>
            </ManagementListHeader>
            <ManagementListBody>
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
            </ManagementListBody>
          </ManagementList>
        ) : null}
      </div>

      {canManageMembers && invitations.length > 0 ? (
        <PendingInvitesSection
          invitationPendingRevocation={invitationPendingRevocation}
          invitations={invitations}
          isRevokePending={revokeInvitationMutation.isPending}
          onRevoke={openRevokeInvitationDialog}
        />
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
