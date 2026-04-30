import type { ReactNode } from 'react'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface MembersTableProps {
  children: ReactNode
}

export function MembersTable({ children }: MembersTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.membersTable}>
        <caption className={styles.visuallyHidden}>Project members</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
