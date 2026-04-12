export interface ConfigItem {
  id: string
  key: string
  createdAt: string
}

export type EditableConfigItem = ConfigItem & {
  isEditing?: boolean
  draftKey?: string
}
