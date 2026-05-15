import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { cx } from '../utils/cx'
import styles from './KebabMenuButton.module.css'
import { useMenuButtonState } from './useMenuButtonState'

interface KebabMenuButtonItem {
  disabled?: boolean
  label: string
  onSelect: () => void
  tone?: 'danger' | 'default'
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
  const menuRef = useRef<HTMLDivElement | null>(null)
  const {
    closeMenu,
    handleTriggerClick,
    handleTriggerKeyDown,
    isOpen,
    menuId,
    rootRef,
  } = useMenuButtonState([menuRef])
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    left: 0,
    minWidth: 0,
    top: 0,
  })

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) {
      return undefined
    }

    const updatePosition = () => {
      if (!triggerRef.current || !menuRef.current) {
        return
      }

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const menuRect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const gap = 8
      const menuWidth = Math.max(menuRect.width, triggerRect.width, 160)

      const nextLeft = Math.min(
        Math.max(gap, triggerRect.right - menuWidth),
        viewportWidth - menuWidth - gap,
      )
      const preferredTop = triggerRect.bottom + gap
      const fallbackTop = triggerRect.top - menuRect.height - gap
      const nextTop =
        preferredTop + menuRect.height <= viewportHeight - gap || fallbackTop < gap
          ? Math.min(preferredTop, viewportHeight - menuRect.height - gap)
          : fallbackTop

      setMenuStyle({
        left: nextLeft,
        minWidth: menuWidth,
        top: Math.max(gap, nextTop),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

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
        ref={triggerRef}
        type="button"
      >
        <span className={styles.triggerLabel}>...</span>
      </button>

      {isOpen ? (
        createPortal(
          <div
            className={styles.menu}
            id={menuId}
            ref={menuRef}
            role="menu"
            style={menuStyle}
          >
            {items.map((item) => (
              <button
                className={cx(
                  styles.menuItem,
                  item.disabled ? styles.menuItemDisabled : undefined,
                  item.tone === 'danger' ? styles.menuItemDanger : undefined,
                )}
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
          </div>,
          document.body,
        )
      ) : null}
    </div>
  )
}
