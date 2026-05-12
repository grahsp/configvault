import styles from './PageLoader.module.css'
import { cx } from '../utils/cx'

export interface PageLoaderProps {
  fullScreen?: boolean
  message?: string
}

export function PageLoader({
  fullScreen = true,
  message = 'Loading...',
}: PageLoaderProps) {
  return (
    <div className={cx(styles.shell, !fullScreen && styles.inlineShell)}>
      <div aria-live="polite" className={styles.status} role="status">
        <div aria-hidden="true" className={styles.spinner} />
        <span className={styles.srOnly}>{message}</span>
      </div>
    </div>
  )
}
