import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../components/ui/button'
import { CopyableInput } from './CopyableInput'
import { StatePanel } from './StatePanel'
import statePanelStyles from './StatePanel.module.css'

describe('shared ui primitives', () => {
  it('renders button variants and disabled state', () => {
    render(
      <>
        <Button type="button" variant="default">
          Save
        </Button>
        <Button disabled type="button" variant="outline">
          Cancel
        </Button>
        <Button type="button" variant="destructive">
          Delete
        </Button>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'data-variant',
      'default',
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'data-variant',
      'outline',
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'destructive',
    )
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

})
