import { Link } from 'react-router-dom'
import { StatusPanel } from '@/components/composed'
import { Button } from '@/components/ui/button'
import { useInvitationAcceptanceFlow } from '../application'

export function InvitationPage() {
  const flow = useInvitationAcceptanceFlow()

  if (flow.errorTitle && flow.errorMessage) {
    return (
      <main className="grid min-h-full place-items-center">
        <section className="w-full rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <StatusPanel
            actions={
              <Button asChild type="button" variant="outline">
                <Link to="/">Back to home</Link>
              </Button>
            }
            role="alert"
            title={flow.errorTitle}
            tone="error"
          >
            <p>{flow.errorMessage}</p>
          </StatusPanel>
        </section>
      </main>
    )
  }

  return (
    <main className="grid min-h-full place-items-center">
      <section className="w-full rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <StatusPanel
          actions={
            flow.actionVisible ? (
              <Button
                onClick={() => {
                  void flow.triggerLogin()
                }}
                type="button"
                variant="outline"
              >
                {flow.actionLabel}
              </Button>
            ) : null
          }
          role="status"
          title={flow.statusTitle}
        >
          <p>{flow.statusMessage}</p>
        </StatusPanel>
      </section>
    </main>
  )
}
