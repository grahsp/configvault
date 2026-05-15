import type { ActiveInvitation } from '../../invitations/domain'
import { InvitationRow } from './InvitationRow'
import {
  ManagementList,
  ManagementListBody,
  ManagementListHeader,
  ManagementListHeaderCell,
  SectionHeader,
} from './ManagementList'

interface PendingInvitesSectionProps {
  invitationPendingRevocation: ActiveInvitation | null
  invitations: ActiveInvitation[]
  isRevokePending: boolean
  onRevoke: (invitation: ActiveInvitation) => void
}

export function PendingInvitesSection({
  invitationPendingRevocation,
  invitations,
  isRevokePending,
  onRevoke,
}: PendingInvitesSectionProps) {
  return (
    <div className="grid gap-4 pt-2">
      <SectionHeader
        title={
          <h2 className="m-0 text-xl font-semibold tracking-tight text-foreground">
            Pending Invites
          </h2>
        }
      />
      <ManagementList caption="Pending Invites">
        <ManagementListHeader>
          <ManagementListHeaderCell>Created by</ManagementListHeaderCell>
          <ManagementListHeaderCell>Created</ManagementListHeaderCell>
          <ManagementListHeaderCell>Expires</ManagementListHeaderCell>
          <ManagementListHeaderCell className="w-px text-right">
            Actions
          </ManagementListHeaderCell>
        </ManagementListHeader>
        <ManagementListBody>
          {invitations.map((invitation) => (
            <InvitationRow
              invitation={invitation}
              isRevokePending={
                isRevokePending &&
                invitationPendingRevocation?.invitationId === invitation.invitationId
              }
              key={invitation.invitationId}
              onRevoke={onRevoke}
            />
          ))}
        </ManagementListBody>
      </ManagementList>
    </div>
  )
}
