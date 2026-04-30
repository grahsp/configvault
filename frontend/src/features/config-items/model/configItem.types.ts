export interface ConfigItem {
  id: string
  key: string
  hasValue: boolean
}

export interface ConfigItemValue {
  value: string
}

export type EditableConfigItem = ConfigItem & {
  isEditing?: boolean
  draftKey?: string
}
