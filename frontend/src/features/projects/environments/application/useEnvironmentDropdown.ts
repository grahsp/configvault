import type { Environment } from '../domain'
import type { EnvironmentDropdownProps } from '../ui/EnvironmentDropdown'
import { useCreateEnvironment } from './useCreateEnvironment.ts'
import { useEnvironmentCreateState } from './useEnvironmentCreateState.ts'
import { useEnvironmentDeleteState } from './useEnvironmentDeleteState.ts'
import { useEnvironmentMenuState } from './useEnvironmentMenuState.ts'
import { useEnvironmentSelection } from './useEnvironmentSelection.ts'
import { useDeleteEnvironment } from './useDeleteEnvironment.ts'
import { useEnvironments } from './useEnvironments.ts'

interface UseEnvironmentDropdownOptions {
  onEnvironmentChange: (environmentId: string) => void
  projectId: string
  selectedEnvironmentId: string
}

export function useEnvironmentDropdown({
  onEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: UseEnvironmentDropdownOptions): EnvironmentDropdownProps {
  const environmentsQuery = useEnvironments(projectId)
  const createEnvironmentMutation = useCreateEnvironment(projectId)
  const deleteEnvironmentMutation = useDeleteEnvironment(projectId)

  const environments = environmentsQuery.data ?? []
  const isLoading = environmentsQuery.isPending
  const hasError = environmentsQuery.isError

  const { selectedEnvironment, selectedIndex } = useEnvironmentSelection({
    environments,
    selectedEnvironmentId,
  })

  function selectEnvironment(environment: Environment) {
    onEnvironmentChange(environment.id)
    handleCloseDropdown()
  }

  function handleCloseDropdown() {
    menu.closeDropdown()
    deleteState.resetDeleteState()
    createState.onResetCreateState()
  }

  function handleCreatedEnvironment(environmentId: string) {
    onEnvironmentChange(environmentId)
  }

  function handleDeletedEnvironment(
    deletedEnvironmentId: string,
    nextEnvironments: Environment[],
  ) {
    menu.setActiveIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(nextEnvironments.length - 1, 0)),
    )
    menu.closeDropdown()

    if (deletedEnvironmentId === selectedEnvironmentId) {
      onEnvironmentChange(nextEnvironments[0]?.id ?? '')
    }
  }

  const menu = useEnvironmentMenuState({
    environments,
    onCloseDropdown: handleCloseDropdown,
    onSelectEnvironment: selectEnvironment,
    selectedIndex,
  })

  const createState = useEnvironmentCreateState({
    createEnvironmentMutation,
    environments,
    listboxId: menu.listboxId,
    onCreatedEnvironment: handleCreatedEnvironment,
    onRequestCloseDropdown: handleCloseDropdown,
    refetchEnvironments: environmentsQuery.refetch,
  })

  const deleteState = useEnvironmentDeleteState({
    deleteEnvironmentMutation,
    environments,
    onDeletedEnvironment: handleDeletedEnvironment,
  })

  const triggerLabel = isLoading
    ? 'Loading...'
    : selectedEnvironment?.environmentName ?? 'Select environment'

  return {
    create: createState,
    deleteDialog: deleteState.environmentPendingDelete
      ? {
          deleteError: deleteState.deleteError,
          environment: deleteState.environmentPendingDelete,
          isPending:
            deleteState.deletingEnvironmentId ===
            deleteState.environmentPendingDelete.id,
          onCancel: deleteState.onCancelDelete,
          onConfirm: deleteState.onConfirmDelete,
        }
      : null,
    list: {
      activeIndex: menu.activeIndex,
      deletingEnvironmentId: deleteState.deletingEnvironmentId,
      environments,
      listboxId: menu.listboxId,
      onOpenDeleteDialog: deleteState.onOpenDeleteDialog,
      onSelectEnvironment: selectEnvironment,
      selectedEnvironmentId,
    },
    menu: {
      hasError,
      isOpen: menu.isOpen,
      listboxId: menu.listboxId,
      wrapperRef: menu.wrapperRef,
    },
    trigger: {
      activeOptionId: menu.activeOptionId,
      isLoading,
      isOpen: menu.isOpen,
      listboxId: menu.listboxId,
      onClick: menu.onTriggerClick,
      onKeyDown: menu.onTriggerKeyDown,
      triggerLabel,
    },
  }
}
