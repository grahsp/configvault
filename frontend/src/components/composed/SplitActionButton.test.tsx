import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SplitActionButton } from './SplitActionButton.tsx'

describe('SplitActionButton', () => {
  it('triggers the primary action and renders secondary actions', async () => {
    const user = userEvent.setup()
    const onPrimaryClick = vi.fn()
    const onImport = vi.fn()
    const onArchive = vi.fn()

    render(
      <SplitActionButton
        primaryAction={{
          label: '+ Add Secret',
          onClick: onPrimaryClick,
        }}
        secondaryActions={[
          {
            label: 'Import Secrets',
            onSelect: onImport,
          },
          {
            label: 'Archive',
            onSelect: onArchive,
            tone: 'danger',
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add Secret' }))
    expect(onPrimaryClick).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Open add secret actions' }))

    expect(screen.getByRole('menuitem', { name: 'Import Secrets' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Import Secrets' })).toHaveClass(
      'cursor-pointer',
    )
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'data-variant',
      'destructive',
    )

    await user.click(screen.getByRole('menuitem', { name: 'Import Secrets' }))
    expect(onImport).toHaveBeenCalledTimes(1)
    expect(onArchive).not.toHaveBeenCalled()
  })

  it('disables both halves when disabled', () => {
    render(
      <SplitActionButton
        disabled
        primaryAction={{
          label: '+ Add Secret',
          onClick: vi.fn(),
        }}
        secondaryActions={[
          {
            label: 'Import Secrets',
            onSelect: vi.fn(),
          },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: '+ Add Secret' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Open add secret actions' }),
    ).toBeDisabled()
  })

  it('renders disabled secondary actions as non-interactive', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <SplitActionButton
        primaryAction={{
          label: '+ Add Secret',
          onClick: vi.fn(),
        }}
        secondaryActions={[
          {
            disabled: true,
            label: 'Import Secrets',
            onSelect,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Open add secret actions' }))

    const menuItem = screen.getByRole('menuitem', { name: 'Import Secrets' })
    expect(menuItem).toHaveAttribute('data-disabled')

    await user.click(menuItem)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('uses an explicit menu label when provided', () => {
    render(
      <SplitActionButton
        primaryAction={{
          label: 'Create',
          menuLabel: 'Open create actions',
          onClick: vi.fn(),
        }}
        secondaryActions={[
          {
            label: 'Import Secrets',
            onSelect: vi.fn(),
          },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Open create actions' })).toBeInTheDocument()
  })

  it('applies the shared rounding class to both the primary and secondary buttons', () => {
    render(
      <SplitActionButton
        primaryAction={{
          label: '+ Add Secret',
          onClick: vi.fn(),
        }}
        secondaryActions={[
          {
            label: 'Import Secrets',
            onSelect: vi.fn(),
          },
        ]}
      />,
    )

    const group = screen.getByRole('group')
    const primaryButton = screen.getByRole('button', { name: '+ Add Secret' })
    const menuButton = screen.getByRole('button', { name: 'Open add secret actions' })

    expect(group).toHaveClass('rounded-md')
    expect(primaryButton).toHaveClass('rounded-md')
    expect(menuButton).toHaveClass('rounded-md')
    expect(primaryButton).not.toHaveClass('rounded-4xl')
    expect(menuButton).not.toHaveClass('rounded-4xl')
  })
})
