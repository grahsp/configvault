import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table'
import { cn } from '../../../../lib/utils'

interface ManagementListProps {
  caption: string
  children: ReactNode
}

interface ManagementListHeaderProps {
  children: ReactNode
}

interface ManagementListHeaderCellProps {
  children: ReactNode
  className?: string
}

interface ManagementListRowProps {
  'aria-label'?: string
  children: ReactNode
  className?: string
}

interface ManagementListCellProps {
  children: ReactNode
  className?: string
}

interface RowActionsProps {
  children?: ReactNode
  className?: string
  emptyLabel?: string
}

interface SectionHeaderProps {
  actions?: ReactNode
  title: ReactNode
}

export function ManagementList({ caption, children }: ManagementListProps) {
  return (
    <Table className="min-w-[var(--table-min-width-sm)] border-separate border-spacing-0 bg-transparent">
      <TableCaption className="sr-only">{caption}</TableCaption>
      {children}
    </Table>
  )
}

export function ManagementListHeader({ children }: ManagementListHeaderProps) {
  return (
    <TableHeader className="[&_tr]:border-border/60 [&_tr]:hover:bg-transparent">
      <TableRow className="hover:bg-transparent">{children}</TableRow>
    </TableHeader>
  )
}

export function ManagementListHeaderCell({
  children,
  className,
}: ManagementListHeaderCellProps) {
  return (
    <TableHead
      className={cn(
        'h-8 border-b border-border/60 bg-muted/35 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70',
        className,
      )}
    >
      {children}
    </TableHead>
  )
}

export function ManagementListBody({ children }: { children: ReactNode }) {
  return (
    <TableBody className="[&_tr:last-child>td]:border-b-0">{children}</TableBody>
  )
}

export function ManagementListRow({
  'aria-label': ariaLabel,
  children,
  className,
}: ManagementListRowProps) {
  return (
    <TableRow
      aria-label={ariaLabel}
      className={cn(
        'border-transparent hover:bg-muted/30',
        className,
      )}
    >
      {children}
    </TableRow>
  )
}

export function ManagementListCell({
  children,
  className,
}: ManagementListCellProps) {
  return (
    <TableCell
      className={cn(
        'border-b border-border/50 px-3 py-3 align-middle text-sm text-foreground',
        className,
      )}
    >
      {children}
    </TableCell>
  )
}

export function RowActions({
  children,
  className,
}: RowActionsProps) {
  return (
    <div
      className={cn(
        'flex min-h-7 items-center justify-end gap-1.5 whitespace-nowrap',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ actions, title }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">{title}</div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
