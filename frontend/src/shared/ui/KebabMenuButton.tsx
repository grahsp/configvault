import { cx } from '../utils/cx'
import styles from './KebabMenuButton.module.css'
import { useMenuButtonState } from './useMenuButtonState'

interface KebabMenuButtonItem {
  disabled?: boolean
  label: string
  onSelect: () => void
}

export interface KebabMenuButtonProps {
  className?: string
  disabled?: boolean
  items: KebabMenuButtonItem[]
  label: string
}

export function KebabMenuButton({
  className,
  disabled = false,
  items,
  label,
}: KebabMenuButtonProps) {
  const {
    closeMenu,
    handleTriggerClick,
    handleTriggerKeyDown,
    isOpen,
    menuId,
    rootRef,
  } = useMenuButtonState()

  return (
    <div className={cx(styles.root, className)} ref={rootRef}>
      <button
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        className={styles.trigger}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        <span className={styles.triggerLabel}>...</span>
      </button>

      {isOpen ? (
        <div className={styles.menu} id={menuId} role="menu">
          {items.map((item) => (
            <button
              className={styles.menuItem}
              disabled={item.disabled}
              key={item.label}
              onClick={() => {
                closeMenu()
                item.onSelect()
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
