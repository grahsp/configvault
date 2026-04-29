import { createApiClient } from '../../../api/apiClient'
import type { AccessTokenGetter } from '../../../api/apiClient'
import type { CurrentUser } from '../model'

export async function getCurrentUser(
  getAccessTokenSilently: AccessTokenGetter,
): Promise<CurrentUser> {
  const client = createApiClient({ getAccessTokenSilently })
  return client.request<CurrentUser>('/me')
}
