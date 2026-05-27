import { ActionMenuButton } from '@/components/composed'
import type { ActiveInvitation } from '../../invitations/domain'
import { formatCreatedDate } from '../../domain'
import {
  ManagementListCell,
  ManagementListRow,
  RowActions,
} from './ManagementList'

interface InvitationRowProps {
  invitation: ActiveInvitation
  isRevokePending: boolean
  onRevoke: (invitation: ActiveInvitation) => void
}

export function InvitationRow({
  invitation,
  isRevokePending,
  onRevoke,
}: InvitationRowProps) {
  return (
    <ManagementListRow>
      <ManagementListCell className="font-medium text-foreground">
        {invitation.createdByName}
      </ManagementListCell>
      <ManagementListCell className="text-muted-foreground">
        {formatCreatedDate(invitation.createdAt)}
      </ManagementListCell>
      <ManagementListCell className="text-muted-foreground">
        {formatCreatedDate(invitation.expiresAt)}
      </ManagementListCell>
      <ManagementListCell className="w-px text-right">
        <RowActions>
          <ActionMenuButton
            items={[
              {
                disabled: isRevokePending,
                label: 'Revoke',
                onSelect: () => onRevoke(invitation),
                tone: 'danger',
              },
            ]}
            label={`Invitation actions for ${invitation.createdByName}`}
          />
        </RowActions>
      </ManagementListCell>
    </ManagementListRow>
  )
}
