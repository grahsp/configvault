import { Link } from 'react-router-dom'
import { Button } from '../../../../components/ui/button'
import { StatusPanel } from '@/components/composed'
import { useInvitationAcceptanceFlow } from '../application'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

export function InvitationPage() {
  const flow = useInvitationAcceptanceFlow()

  if (flow.errorTitle && flow.errorMessage) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <StatusPanel
            actions={
              <Link className={styles.backActionLink} to="/">
                Back to home
              </Link>
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
    <main className={styles.page}>
      <section className={styles.card}>
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
