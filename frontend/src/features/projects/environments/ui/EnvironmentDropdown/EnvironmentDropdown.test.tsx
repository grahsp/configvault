import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { EnvironmentDropdownProps } from './EnvironmentDropdown.tsx'
import { EnvironmentDropdown } from './EnvironmentDropdown.tsx'

function createProps(
  overrides: Partial<EnvironmentDropdownProps> = {},
): EnvironmentDropdownProps {
  const baseProps: EnvironmentDropdownProps = {
    create: {
      createError: '',
      createInputRef: { current: null },
      createName: '',
      isCreatePending: false,
      isCreating: false,
      listboxId: 'environment-listbox',
      onCreateInputChange: vi.fn(),
      onCreateInputKeyDown: vi.fn(),
      onCreateStart: vi.fn(),
      onResetCreateState: vi.fn(),
      onSubmitCreate: vi.fn(),
    },
    deleteDialog: null,
    list: {
      activeIndex: 0,
      deletingEnvironmentId: '',
      environments: [
        {
          id: 'env-development',
          environmentName: 'Development',
        },
        {
          id: 'env-production',
          environmentName: 'Production',
        },
      ],
      listboxId: 'environment-listbox',
      onOpenDeleteDialog: vi.fn(),
      onSelectEnvironment: vi.fn(),
      selectedEnvironmentId: 'env-development',
    },
    menu: {
      hasError: false,
      isOpen: true,
      listboxId: 'environment-listbox',
      wrapperRef: { current: null },
    },
    trigger: {
      activeOptionId: undefined,
      isLoading: false,
      isOpen: true,
      listboxId: 'environment-listbox',
      onClick: vi.fn(),
      onKeyDown: vi.fn(),
      triggerLabel: 'Development',
    },
  }

  return {
    ...baseProps,
    ...overrides,
  }
}

describe('EnvironmentDropdown view', () => {
  it('renders loaded options and selected state', () => {
    render(<EnvironmentDropdown {...createProps()} />)

    const listbox = screen.getByRole('listbox')

    expect(
      within(listbox).getByRole('option', { name: 'Development' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      within(listbox).getByRole('option', { name: 'Production' }),
    ).toHaveAttribute('aria-selected', 'false')
  })

  it('renders empty state when no environments exist', () => {
    render(
      <EnvironmentDropdown
        {...createProps({
          list: {
            ...createProps().list,
            environments: [],
          },
        })}
      />,
    )

    expect(screen.getByText('No environments found')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '+ Add environment' }),
    ).toBeInTheDocument()
  })

  it('shows the create form when creating', async () => {
    const user = userEvent.setup()
    const onCreateStart = vi.fn()
    render(
      <EnvironmentDropdown
        {...createProps({
          create: {
            ...createProps().create,
            isCreating: false,
            onCreateStart,
          },
        })}
      />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add environment' }))

    expect(onCreateStart).toHaveBeenCalledTimes(1)
  })

  it('shows the delete dialog when an environment is pending delete', () => {
    render(
      <EnvironmentDropdown
        {...createProps({
          deleteDialog: {
            deleteError: '',
            environment: {
              id: 'env-production',
              environmentName: 'Production',
            },
            isPending: false,
            onCancel: vi.fn(),
            onConfirm: vi.fn(),
          },
        })}
      />,
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Delete environment' }),
    ).toBeInTheDocument()
  })
})
