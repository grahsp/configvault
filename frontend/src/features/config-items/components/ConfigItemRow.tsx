import { useEffect, useRef } from 'react'
import type { ConfigItem } from '../types/ConfigItem'
import styles from './ConfigItemsTable.module.css'

interface ConfigItemRowProps {
  configItem: ConfigItem
  onDelete: (configItem: ConfigItem) => void
  onRename: (configItem: ConfigItem) => void
  shouldFocus?: boolean
}

const maskedValue = '******'

export function ConfigItemRow({
  configItem,
  onDelete,
  onRename,
  shouldFocus = false,
}: ConfigItemRowProps) {
  const keyCellRef = useRef<HTMLTableCellElement>(null)

  useEffect(() => {
    if (shouldFocus) {
      keyCellRef.current?.focus()
    }
  }, [shouldFocus])

  return (
    <tr>
      <th ref={keyCellRef} scope="row" tabIndex={shouldFocus ? -1 : undefined}>
        <span className={styles.configKey}>{configItem.key}</span>
      </th>
      <td>
        <span className={styles.maskedValue}>{maskedValue}</span>
      </td>
      <td className={styles.actionsColumn}>
        <div className={styles.rowActions}>
          <button
            aria-label={`Rename ${configItem.key}`}
            className={styles.rowAction}
            onClick={() => onRename(configItem)}
            type="button"
          >
            Rename
          </button>
          <button
            aria-label={`Delete ${configItem.key}`}
            className={styles.rowAction}
            onClick={() => onDelete(configItem)}
            type="button"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
