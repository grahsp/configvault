export interface Secret {
  id: string
  key: string
  hasValue: boolean
}

export interface SecretValue {
  value: string
}

export interface SecretValueRevisionSummary {
  revision: number
  modifiedByDisplayName: string
  modifiedAt: string
  isCurrent: boolean
}

export interface SecretValueRevision extends SecretValueRevisionSummary {
  value: string
}
