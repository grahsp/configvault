import {
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { cx } from '../utils/cx'
import styles from './SplitButton.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

export interface SplitButtonProps {
  actionLabel: string
  className?: string
  disabled?: boolean
  menuLabel: string
  menuActionLabel: string
  onActionClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  onMenuActionClick: () => void
  variant: ButtonVariant
}

export function SplitButton({
  actionLabel,
  className,
  disabled = false,
  menuLabel,
  menuActionLabel,
  onActionClick,
  onMenuActionClick,
  variant,
}: SplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleToggleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  const handleMenuActionClick = () => {
    setIsOpen(false)
    onMenuActionClick()
  }

  return (
    <div
      className={cx(styles.splitButton, styles[`${variant}Group`], className)}
      ref={rootRef}
    >
      <button
        className={cx(styles.action, styles[variant])}
        disabled={disabled}
        onClick={onActionClick}
        type="button"
      >
        {actionLabel}
      </button>
      <button
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={menuLabel}
        className={cx(styles.toggle, styles[variant])}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleToggleKeyDown}
        type="button"
      >
        <DownArrowIcon />
      </button>

      {isOpen ? (
        <div className={styles.menu} id={menuId} role="menu">
          <button
            className={styles.menuItem}
            onClick={handleMenuActionClick}
            role="menuitem"
            type="button"
          >
            {menuActionLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function DownArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.toggleIcon}
      fill="currentColor"
      viewBox="0 0 12 12"
    >
      <path d="M6 8.4 2.1 4.5h7.8L6 8.4Z" />
    </svg>
  )
}
