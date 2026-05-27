import { type FormEvent, useId, useState } from 'react'
import { toast } from 'sonner'
import { CopyableInput } from '@/components/composed'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCreateInvitation } from '@/features/projects/invitations/application'

interface InviteMemberDialogProps {
  projectId: string
}

function buildGeneratedLink(token: string) {
  return new URL(`/invitations/${token}`, window.location.origin).toString()
}

export function InviteMemberDialog({ projectId }: InviteMemberDialogProps) {
  const createInvitationMutation = useCreateInvitation(projectId)
  const userIdInputId = useId()
  const userIdErrorId = useId()
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [userIdError, setUserIdError] = useState('')

  function resetUserIdError() {
    if (userIdError) {
      setUserIdError('')
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setUserId('')
      setGeneratedLink(null)
      setUserIdError('')
      createInvitationMutation.reset()
    }
  }

  function handleUserIdSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUserId = userId.trim()

    if (!trimmedUserId) {
      setUserIdError('Enter a user ID.')
      return
    }

    setUserIdError('')
    setUserId('')
  }

  async function handleGenerateLink() {
    if (createInvitationMutation.isPending) {
      return
    }

    createInvitationMutation.mutate(undefined, {
      onSuccess: ({ token }) => {
        setGeneratedLink(buildGeneratedLink(token))
      },
    })
  }

  async function handleCopyLink() {
    if (!generatedLink) {
      return
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }

      await navigator.clipboard.writeText(generatedLink)
      toast.success('Invitation link copied to clipboard.')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Invitation link could not be copied.'

      toast.error(message)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button type="button">+ Invite member</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="gap-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite to project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 text-left">
          <form
            aria-label="Invite by user ID"
            className="flex flex-col gap-2.5"
            onSubmit={handleUserIdSubmit}
          >
            <h3 className="text-sm font-semibold text-foreground">Invite by user ID</h3>
            <div className="space-y-1">
              <Label className="text-foreground" htmlFor={userIdInputId}>
                User ID
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Input
                  aria-describedby={userIdError ? userIdErrorId : undefined}
                  aria-invalid={userIdError ? 'true' : undefined}
                  className="h-10"
                  id={userIdInputId}
                  onChange={(event) => {
                    setUserId(event.target.value)
                    resetUserIdError()
                  }}
                  placeholder="user_12345"
                  value={userId}
                />
                {userIdError ? (
                  <p className="text-sm text-destructive" id={userIdErrorId} role="alert">
                    {userIdError}
                  </p>
                ) : null}
              </div>

              <Button className="h-10 px-4" type="submit">
                Send invite
              </Button>
            </div>
          </form>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground">Invite via link</h3>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can join the project
              </p>
            </div>

            {generatedLink ? (
              <CopyableInput
                ariaLabel="Generated invitation link"
                onCopy={() => void handleCopyLink()}
                value={generatedLink}
              />
            ) : (
              <div>
                <Button
                  disabled={createInvitationMutation.isPending}
                  onClick={handleGenerateLink}
                  type="button"
                  variant="outline"
                >
                  {createInvitationMutation.isPending ? 'Generating link...' : 'Generate link'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
