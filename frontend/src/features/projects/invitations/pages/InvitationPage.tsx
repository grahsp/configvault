import { Link } from 'react-router-dom'
import { Button, StatePanel } from '../../../../shared/ui'
import { useInvitationAcceptanceFlow } from '../application'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

export function InvitationPage() {
  const flow = useInvitationAcceptanceFlow()

  if (flow.errorTitle && flow.errorMessage) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <StatePanel role="alert" title={flow.errorTitle} tone="error">
            <p>{flow.errorMessage}</p>
            <Link className={styles.backActionLink} to="/">
              Back to home
            </Link>
          </StatePanel>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <StatePanel role="status" title={flow.statusTitle}>
          <p>{flow.statusMessage}</p>
          {flow.actionVisible ? (
            <Button
              onClick={() => {
                void flow.triggerLogin()
              }}
              type="button"
              variant="secondary"
            >
              {flow.actionLabel}
            </Button>
          ) : null}
        </StatePanel>
      </section>
    </main>
  )
}
