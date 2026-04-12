import type { ReactNode } from 'react'
import { useCallback, useRef, useState } from 'react'
import type { AddToastInput } from './toastContext'
import { ToastContext } from './toastContext'
import styles from './ToastProvider.module.css'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toastDurationMs = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextToastId = useRef(0)

  const removeToast = useCallback((toastId: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    )
  }, [])

  const addToast = useCallback(
    ({ message, type }: AddToastInput) => {
      const toastId = nextToastId.current
      nextToastId.current += 1

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id: toastId,
          message,
          type,
        },
      ])

      window.setTimeout(() => removeToast(toastId), toastDurationMs)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {toasts.length > 0 ? (
        <ul
          aria-label="Notifications"
          aria-live="polite"
          className={styles.toastViewport}
        >
          {toasts.map((toast) => (
            <li
              className={`${styles.toast} ${
                toast.type === 'error'
                  ? styles.toastError
                  : styles.toastSuccess
              }`}
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              {toast.message}
            </li>
          ))}
        </ul>
      ) : null}
    </ToastContext.Provider>
  )
}
