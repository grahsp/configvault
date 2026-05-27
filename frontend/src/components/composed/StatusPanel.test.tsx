import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusPanel } from './StatusPanel.tsx'

describe('StatusPanel', () => {
  it('renders content with the default tone', () => {
    render(
      <StatusPanel title="Nothing here yet">
        <p>Add your first record.</p>
      </StatusPanel>,
    )

    const panel = screen.getByText('Nothing here yet').closest('[data-slot="status-panel"]')

    expect(panel).toHaveAttribute('data-tone', 'default')
    expect(screen.getByText('Add your first record.')).toBeInTheDocument()
  })

  it('renders error tone, actions, and roles', () => {
    render(
      <StatusPanel
        actions={<button type="button">Retry</button>}
        role="alert"
        title="Load failed"
        tone="error"
      >
        <p>Try again in a moment.</p>
      </StatusPanel>,
    )

    const alert = screen.getByRole('alert')

    expect(alert).toHaveAttribute('data-slot', 'status-panel')
    expect(alert).toHaveAttribute('data-tone', 'error')
    expect(within(alert).getByText('Load failed')).toBeInTheDocument()
    expect(within(alert).getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
