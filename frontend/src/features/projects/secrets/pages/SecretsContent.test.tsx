import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Secret } from '../domain'
import { SecretsContent, type SecretsContentProps } from './SecretsContent.tsx'

function createSecret(overrides?: Partial<Secret>): Secret {
  return {
    hasValue: true,
    id: 'secret-1',
    key: 'API_KEY',
    revision: 1,
    ...overrides,
  }
}

function createProps(
  overrides?: Partial<SecretsContentProps>,
): SecretsContentProps {
  const secret = createSecret()

  return {
    hasActiveSearch: false,
    hasSelectedEnvironment: true,
    isError: false,
    isLoading: false,
    isSaving: false,
    loadErrorMessage: undefined,
    onCancelEdit: vi.fn(),
    onDraftKeyChange: vi.fn(),
    onDraftValueChange: vi.fn(),
    onOpenAddSecret: vi.fn(),
    onOpenHistory: vi.fn(),
    onOpenImportModal: vi.fn(),
    onReveal: vi.fn().mockResolvedValue(undefined),
    onRetry: vi.fn(),
    onSaveEdit: vi.fn().mockResolvedValue(undefined),
    onStartValueEdit: vi.fn(),
    onToggleDelete: vi.fn(),
    rows: [
      {
        draftKey: secret.key,
        draftValue: null,
        isMarkedForDeletion: false,
        isRevealing: false,
        isValueRevealed: false,
        secret,
        shouldFocus: false,
      },
    ],
    searchTerm: '',
    ...overrides,
  }
}

describe('SecretsContent', () => {
  it('renders only the loading branch', () => {
    render(<SecretsContent {...createProps({ isLoading: true, rows: [] })} />)

    expect(screen.getByText('Loading secrets...')).toBeInTheDocument()
    expect(screen.queryByText('No secrets yet')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Project secrets' })).not.toBeInTheDocument()
  })

  it('renders only the error branch', () => {
    render(
      <SecretsContent
        {...createProps({
          isError: true,
          loadErrorMessage: 'Load failed.',
          rows: [],
        })}
      />,
    )

    expect(screen.getByText('Failed to load secrets.')).toBeInTheDocument()
    expect(screen.getByText('Load failed.')).toBeInTheDocument()
    expect(screen.queryByText('No secrets yet')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Project secrets' })).not.toBeInTheDocument()
  })

  it('renders only the empty branch', () => {
    render(<SecretsContent {...createProps({ rows: [] })} />)

    expect(screen.getByText('No secrets yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add Secret' })).toBeInTheDocument()
    expect(screen.queryByText('Loading secrets...')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Project secrets' })).not.toBeInTheDocument()
  })

  it('renders only the list branch when rows exist', () => {
    render(<SecretsContent {...createProps()} />)

    expect(
      screen.getByRole('list', { name: 'Project secrets' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading secrets...')).not.toBeInTheDocument()
    expect(screen.queryByText('Failed to load secrets.')).not.toBeInTheDocument()
    expect(screen.queryByText('No secrets yet')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  it('renders the blocked branch when no environment is selected', () => {
    render(
      <SecretsContent
        {...createProps({
          hasSelectedEnvironment: false,
          rows: [],
        })}
      />,
    )

    expect(screen.getByText('No environment available')).toBeInTheDocument()
    expect(screen.queryByText('Loading secrets...')).not.toBeInTheDocument()
    expect(screen.queryByText('No secrets yet')).not.toBeInTheDocument()
  })

  it('renders a search-specific empty state when no secrets match', () => {
    render(
      <SecretsContent
        {...createProps({
          hasActiveSearch: true,
          rows: [],
          searchTerm: 'missing',
        })}
      />,
    )

    expect(screen.getByText('No matching secrets')).toBeInTheDocument()
    expect(
      screen.getByText(/No secrets matched "missing"/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('No secrets yet')).not.toBeInTheDocument()
  })

  it('shows a history action only for secrets that have a saved value', () => {
    render(
      <SecretsContent
        {...createProps({
          rows: [
            {
              draftKey: 'API_KEY',
              draftValue: null,
              isMarkedForDeletion: false,
              isRevealing: false,
              isValueRevealed: false,
              secret: createSecret(),
              shouldFocus: false,
            },
            {
              draftKey: 'EMPTY_KEY',
              draftValue: null,
              isMarkedForDeletion: false,
              isRevealing: false,
              isValueRevealed: false,
              secret: createSecret({
                hasValue: false,
                id: 'secret-2',
                key: 'EMPTY_KEY',
              }),
              shouldFocus: false,
            },
          ],
        })}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'View history for API_KEY' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'View history for EMPTY_KEY' }),
    ).not.toBeInTheDocument()
  })
})
