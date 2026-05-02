import type { ReactNode } from 'react'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface InvitationLinksTableProps {
  children: ReactNode
}

export function InvitationLinksTable({ children }: InvitationLinksTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.membersTable}>
        <caption className={styles.visuallyHidden}>Active invitation links</caption>
        <thead>
          <tr>
            <th scope="col">Created by</th>
            <th scope="col">Created</th>
            <th scope="col">Expires</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
