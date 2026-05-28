import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Trash2Icon } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { ActionMenuButton } from './ActionMenuButton.tsx'

describe('ActionMenuButton', () => {
  it('renders an accessible icon trigger with the provided label', () => {
    render(
      <ActionMenuButton
        items={[{ label: 'Edit', onSelect: vi.fn() }]}
        label="Open row actions"
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Open row actions' })

    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('data-size', 'icon-sm')
    expect(trigger).toHaveAttribute('data-variant', 'ghost')
  })

  it('opens menu items and calls onSelect', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onArchive = vi.fn()

    render(
      <ActionMenuButton
        items={[
          { label: 'Edit', onSelect: onEdit },
          { label: 'Archive', onSelect: onArchive },
        ]}
        label="Open row actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Open row actions' }))

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onArchive).not.toHaveBeenCalled()
  })

  it('applies the destructive variant for danger items', async () => {
    const user = userEvent.setup()

    render(
      <ActionMenuButton
        items={[
          {
            icon: Trash2Icon,
            label: 'Remove',
            onSelect: vi.fn(),
            tone: 'danger',
          },
        ]}
        label="Open row actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Open row actions' }))

    const menuItem = screen.getByRole('menuitem', { name: 'Remove' })

    expect(menuItem).toHaveAttribute('data-variant', 'destructive')
    expect(menuItem).toHaveAttribute('data-slot', 'dropdown-menu-item')
    expect(menuItem.querySelector('svg')).toBeInTheDocument()
  })

  it('disables the trigger and disabled menu items', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(
      <ActionMenuButton
        disabled
        items={[{ label: 'Remove', onSelect }]}
        label="Open row actions"
      />,
    )

    expect(screen.getByRole('button', { name: 'Open row actions' })).toBeDisabled()

    rerender(
      <ActionMenuButton
        items={[{ disabled: true, label: 'Remove', onSelect }]}
        label="Open row actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Open row actions' }))

    const menuItem = screen.getByRole('menuitem', { name: 'Remove' })
    expect(menuItem).toHaveAttribute('data-disabled')

    await user.click(menuItem)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('supports the input-group trigger', () => {
    render(
      <ActionMenuButton
        items={[{ label: 'View history', onSelect: vi.fn() }]}
        label="Open actions for API_KEY"
        trigger="input-group"
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Open actions for API_KEY' })

    expect(trigger).toHaveAttribute('data-size', 'icon-sm')
    expect(trigger).toHaveAttribute('data-variant', 'ghost')
    expect(trigger).toHaveClass('rounded-4xl')
  })
})
