import styles from './ProjectDetailPage/ProjectDetailPage.module.css'

export function SecretsPage() {
  return (
    <section className={styles.placeholder} aria-labelledby="secrets-title">
      <h2 className={styles.placeholderTitle} id="secrets-title">
        Secrets
      </h2>
      <p className={styles.placeholderCopy}>
        Vault entries and controls will appear here.
      </p>
    </section>
  )
}
