import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import buttonStyles from './Button.module.css'
import { ConfirmationDialog } from './ConfirmationDialog'
import { CopyableInput } from './CopyableInput'
import { KebabMenuButton } from './KebabMenuButton'
import kebabMenuButtonStyles from './KebabMenuButton.module.css'
import { Modal } from './Modal'
import { PageLoader } from './PageLoader'
import { SideWindow } from './SideWindow'
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

  it('renders side window semantics, header action, and close interactions', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <SideWindow
        description={<p>Review the latest revisions.</p>}
        headerAction={<button type="button">x</button>}
        onClose={onClose}
        title="Secret history"
      >
        <p>Revision list</p>
      </SideWindow>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Secret history' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText('Review the latest revisions.')).toBeInTheDocument()
    expect(within(dialog).getByText('Revision list')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'x' })).toBeInTheDocument()

    await user.click(dialog.parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
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

  it('renders a kebab menu trigger and runs menu actions', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <KebabMenuButton
        items={[
          {
            label: 'Copy Secrets (.env)',
            onSelect,
          },
        ]}
        label="Secret actions"
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Secret actions' })

    expect(trigger).toHaveClass(kebabMenuButtonStyles.trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveTextContent('...')

    await user.keyboard('{Tab}{Enter}')

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Copy Secrets (.env)' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders destructive kebab items with danger styling', async () => {
    const user = userEvent.setup()

    render(
      <KebabMenuButton
        items={[
          {
            label: 'Remove',
            onSelect: vi.fn(),
            tone: 'danger',
          },
        ]}
        label="Member actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Member actions' }))

    expect(screen.getByRole('menuitem', { name: 'Remove' })).toHaveClass(
      kebabMenuButtonStyles.menuItemDanger,
    )
  })

  it('keeps disabled kebab menu items non-interactive', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <KebabMenuButton
        items={[
          {
            disabled: true,
            label: 'Remove',
            onSelect,
          },
        ]}
        label="Member actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Member actions' }))

    const menuItem = screen.getByRole('menuitem', { name: 'Remove' })
    expect(menuItem).toHaveClass(kebabMenuButtonStyles.menuItemDisabled)
    expect(menuItem).toBeDisabled()

    await user.click(menuItem)
    expect(onSelect).not.toHaveBeenCalled()
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

  it('renders a read-only copyable input and runs the copy action', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()

    render(
      <CopyableInput
        ariaLabel="Invitation link"
        onCopy={onCopy}
        value="http://localhost:3000/invitations/invite-token-123"
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Invitation link' })).toHaveValue(
      'http://localhost:3000/invitations/invite-token-123',
    )
    expect(screen.getByRole('textbox', { name: 'Invitation link' })).toHaveAttribute(
      'readonly',
    )

    await user.hover(screen.getByRole('button', { name: 'Copy' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy')

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(onCopy).toHaveBeenCalledTimes(1)
  })

  it('renders a full-page spinner loader', () => {
    render(<PageLoader />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading...')
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
