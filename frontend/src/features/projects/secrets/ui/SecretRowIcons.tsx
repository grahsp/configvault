import styles from './SecretsTable.module.css'

export function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.8 12c2.3-4.1 5.7-6.2 9.2-6.2s6.9 2.1 9.2 6.2c-2.3 4.1-5.7 6.2-9.2 6.2S5.1 16.1 2.8 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle
        cx="12"
        cy="12"
        r="3.1"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  )
}

export function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.8 12c2.3-4.1 5.7-6.2 9.2-6.2s6.9 2.1 9.2 6.2c-2.3 4.1-5.7 6.2-9.2 6.2S5.1 16.1 2.8 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle
        cx="12"
        cy="12"
        r="3.1"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M4.5 4.5 19.5 19.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.5 5.2h7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M6.2 7.6h11.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M8 7.6v10.1c0 .8.6 1.4 1.4 1.4h5.2c.8 0 1.4-.6 1.4-1.4V7.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M10.2 10.2v6.1M13.8 10.2v6.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

export function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9.2 8.4 5.8 11.8l3.4 3.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M6.3 11.8h8.5a4.8 4.8 0 1 1 0 9.6h-2.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

export function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.8 7.6V3.9m0 0H8m-3.2 0a8.6 8.6 0 1 1-1.8 9.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M12 7.8v4.5l2.9 1.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}
