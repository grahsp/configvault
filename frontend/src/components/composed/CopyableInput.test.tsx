import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CopyableInput } from '@/components/composed/CopyableInput'

describe('CopyableInput', () => {
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
