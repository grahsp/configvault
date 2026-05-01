import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import buttonStyles from './Button.module.css'
import { ConfirmationDialog } from './ConfirmationDialog'
import { Modal } from './Modal'
import { SplitButton } from './SplitButton'
import splitButtonStyles from './SplitButton.module.css'
import { StatePanel } from './StatePanel'
import statePanelStyles from './StatePanel.module.css'

describe('shared ui primitives', () => {
  it('renders button variants and disabled state', () => {
    render(
      <>
        <Button type="button" variant="primary">
          Save
        </Button>
        <Button disabled type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="button" variant="danger">
          Delete
        </Button>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      buttonStyles.primary,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass(
      buttonStyles.secondary,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      buttonStyles.danger,
    )
  })

  it('renders modal title, description, actions, and dialog semantics', () => {
    render(
      <Modal
        actions={<button type="button">Confirm</button>}
        description={<p>Changes apply immediately.</p>}
        headerAction={<button type="button">Close</button>}
        title="Manage project"
      >
        <p>Body copy</p>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Manage project' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText('Changes apply immediately.')).toBeInTheDocument()
    expect(within(dialog).getByText('Body copy')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders split button actions and menu semantics', async () => {
    const user = userEvent.setup()
    const onActionClick = vi.fn()
    const onMenuActionClick = vi.fn()

    render(
      <SplitButton
        actionLabel="+ Add Secret"
        menuActionLabel="Import Secrets"
        menuLabel="Open secret actions"
        onActionClick={onActionClick}
        onMenuActionClick={onMenuActionClick}
        variant="primary"
      />,
    )

    const actionButton = screen.getByRole('button', { name: '+ Add Secret' })
    const toggleButton = screen.getByRole('button', {
      name: 'Open secret actions',
    })

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    expect(toggleButton.querySelector(`.${splitButtonStyles.toggleIcon}`)).not.toBeNull()
    expect(toggleButton).not.toHaveTextContent(/^v$/i)

    await user.click(actionButton)
    expect(onActionClick).toHaveBeenCalledTimes(1)

    await user.click(toggleButton)

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Import Secrets' }))

    expect(onMenuActionClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders state panel tones, actions, and roles', () => {
    const { rerender } = render(
      <StatePanel title="Nothing here yet">
        <p>Add your first record.</p>
      </StatePanel>,
    )

    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first record.')).toBeInTheDocument()

    rerender(
      <StatePanel
        actions={<button type="button">Retry</button>}
        role="alert"
        title="Load failed"
        tone="error"
      >
        <p>Try again in a moment.</p>
      </StatePanel>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass(statePanelStyles.error)
    expect(within(alert).getByText('Load failed')).toBeInTheDocument()
    expect(within(alert).getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('keeps confirmation dialog confirm/cancel flows and pending state', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const { rerender } = render(
      <ConfirmationDialog
        confirmLabel="Delete"
        isPending={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Delete project"
      >
        <p>Delete this project?</p>
      </ConfirmationDialog>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Delete project' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)

    rerender(
      <ConfirmationDialog
        confirmLabel="Delete"
        isPending
        onCancel={onCancel}
        onConfirm={onConfirm}
        pendingConfirmLabel="Deleting"
        title="Delete project"
      >
        <p>Delete this project?</p>
      </ConfirmationDialog>,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Deleting' })).toBeDisabled()
  })
})
