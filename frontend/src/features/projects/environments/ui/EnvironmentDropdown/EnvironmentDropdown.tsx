import type { RefObject } from 'react'
import { DeleteEnvironmentDialog } from './DeleteEnvironmentDialog.tsx'
import type { EnvironmentCreateSectionProps } from './EnvironmentCreateSection.tsx'
import { EnvironmentCreateSection } from './EnvironmentCreateSection.tsx'
import {EnvironmentDropdownTrigger, type EnvironmentDropdownTriggerProps} from './EnvironmentDropdownTrigger.tsx'
import { EnvironmentOptionsList } from './EnvironmentOptionsList.tsx'
import type { EnvironmentOptionsListProps } from './EnvironmentOptionsList.tsx'
import type { EnvironmentDeleteDialogProps } from './DeleteEnvironmentDialog.tsx'
import styles from './EnvironmentDropdown.module.css'

export interface EnvironmentDropdownMenuProps {
  hasError: boolean
  isOpen: boolean
  listboxId: string
  wrapperRef: RefObject<HTMLDivElement | null>
}

export interface EnvironmentDropdownProps {
  create: EnvironmentCreateSectionProps
  deleteDialog: EnvironmentDeleteDialogProps | null
  list: EnvironmentOptionsListProps
  menu: EnvironmentDropdownMenuProps
  trigger: EnvironmentDropdownTriggerProps
}

export function EnvironmentDropdown({
  create,
  deleteDialog,
  list,
  menu,
  trigger,
}: EnvironmentDropdownProps) {
  const { hasError, isOpen, listboxId, wrapperRef } = menu

  return (
    <div className={styles.environmentDropdown} ref={wrapperRef}>
      <EnvironmentDropdownTrigger {...trigger} />

      {isOpen ? (
        <div className={styles.menu} id={listboxId} role="listbox">
          {hasError ? (
            <p className={styles.errorState} role="alert">
              Environments could not load.
            </p>
          ) : null}

          {!hasError && list.environments.length === 0 ? (
            <p className={styles.emptyState}>No environments found</p>
          ) : null}

          {!hasError ? <EnvironmentOptionsList {...list} /> : null}

          {!hasError ? (
            <>
              <div className={styles.divider} role="separator" />
              <EnvironmentCreateSection {...create} />
            </>
          ) : null}
        </div>
      ) : null}

      {deleteDialog ? <DeleteEnvironmentDialog {...deleteDialog} /> : null}
    </div>
  )
}
