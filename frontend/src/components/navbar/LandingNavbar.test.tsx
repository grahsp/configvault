import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LandingNavbar } from './LandingNavbar'

describe('LandingNavbar', () => {
  it('renders the landing navigation links', () => {
    render(
      <MemoryRouter>
        <LandingNavbar onLogin={vi.fn()} onSignup={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'KeyVault' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    )
  })

  it('calls the auth handlers from the account actions', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    const onSignup = vi.fn()

    render(
      <MemoryRouter>
        <LandingNavbar onLogin={onLogin} onSignup={onSignup} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(onLogin).toHaveBeenCalledTimes(1)
    expect(onSignup).toHaveBeenCalledTimes(1)
  })
})
