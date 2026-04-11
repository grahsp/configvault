import styles from './ProjectDetailPage/ProjectDetailPage.module.css'

export function MembersPage() {
  return (
    <section className={styles.placeholder} aria-labelledby="members-title">
      <h2 className={styles.placeholderTitle} id="members-title">
        Members
      </h2>
      <p className={styles.placeholderCopy}>
        Project access and role controls will appear here.
      </p>
    </section>
  )
}
