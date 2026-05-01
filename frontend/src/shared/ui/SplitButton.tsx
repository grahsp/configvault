import { type ButtonHTMLAttributes } from 'react'
import { cx } from '../utils/cx'
import styles from './SplitButton.module.css'
import { useMenuButtonState } from './useMenuButtonState'

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
  const {
    closeMenu,
    handleTriggerClick,
    handleTriggerKeyDown,
    isOpen,
    menuId,
    rootRef,
  } = useMenuButtonState()

  const handleMenuActionClick = () => {
    closeMenu()
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
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
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
