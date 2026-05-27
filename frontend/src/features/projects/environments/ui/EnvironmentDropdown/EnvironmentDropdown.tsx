import type { RefObject } from 'react'
import { Separator } from '@/components/ui/separator'
import { DeleteEnvironmentDialog } from './DeleteEnvironmentDialog.tsx'
import type { EnvironmentDeleteDialogProps } from './DeleteEnvironmentDialog.tsx'
import type { EnvironmentCreateSectionProps } from './EnvironmentCreateSection.tsx'
import { EnvironmentCreateSection } from './EnvironmentCreateSection.tsx'
import {
  EnvironmentDropdownTrigger,
  type EnvironmentDropdownTriggerProps,
} from './EnvironmentDropdownTrigger.tsx'
import { EnvironmentOptionsList } from './EnvironmentOptionsList.tsx'
import type { EnvironmentOptionsListProps } from './EnvironmentOptionsList.tsx'

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
    <div
      className="relative inline-grid w-[11.25rem] max-w-full gap-1.5"
      ref={wrapperRef}
    >
      <EnvironmentDropdownTrigger {...trigger} />

      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+0.375rem)] z-10 grid w-full min-w-56 gap-1 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-md"
          id={listboxId}
          role="listbox"
        >
          {hasError ? (
            <p
              className="m-0 px-2.5 py-2 text-sm font-medium text-destructive"
              role="alert"
            >
              Environments could not load.
            </p>
          ) : null}

          {!hasError && list.environments.length === 0 ? (
            <p className="m-0 px-2.5 py-2 text-sm font-medium text-muted-foreground">
              No environments found
            </p>
          ) : null}

          {!hasError ? <EnvironmentOptionsList {...list} /> : null}

          {!hasError ? (
            <>
              <Separator className="my-1" />
              <EnvironmentCreateSection {...create} />
            </>
          ) : null}
        </div>
      ) : null}

      {deleteDialog ? <DeleteEnvironmentDialog {...deleteDialog} /> : null}
    </div>
  )
}
