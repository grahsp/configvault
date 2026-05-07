export interface Secret {
  id: string
  key: string
  hasValue: boolean
  revision: number
}

export interface SecretValue {
  value: string
  revision: number
}

export interface SecretValueRevisionSummary {
  revision: number
  createdByDisplayName: string
  modifiedAt: string
  isCurrent: boolean
}

export interface SecretValueRevision extends SecretValueRevisionSummary {
  value: string
}
