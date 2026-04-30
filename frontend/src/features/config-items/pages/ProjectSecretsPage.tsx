import { useOutletContext } from 'react-router-dom'
import type { ProjectLayoutContext } from '../../projects/pages/ProjectDetailPage'
import {
  useConfigItemsTableState,
  useProjectSecretsPageState,
} from '../model'
import { ProjectSecretsPageView } from './ProjectSecretsPageView'

export function ProjectSecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()
  const pageState = useProjectSecretsPageState(
    project.id,
    selectedEnvironmentName,
  )
  const tableState = useConfigItemsTableState({
    environmentName: selectedEnvironmentName,
    focusedConfigItemId: pageState.focusedConfigItemId,
    onFocusConfigItem: pageState.onFocusConfigItem,
    projectId: project.id,
  })

  return (
    <ProjectSecretsPageView
      canCopyExport={Boolean(selectedEnvironmentName)}
      isCopyingExport={pageState.isCopyingExport}
      onCopyExport={pageState.onCopyExport}
      tableState={tableState}
    />
  )
}
