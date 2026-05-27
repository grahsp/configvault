import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders variants and disabled state', () => {
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
})
