import { createContext } from 'react'

export type ToastType = 'success' | 'error'

export interface AddToastInput {
  message: string
  type: ToastType
}

export interface ToastContextValue {
  addToast: (toast: AddToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
