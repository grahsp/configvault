import { useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useCurrentUser } from '@/features/users/model'

export function ProfilePage() {
  const { isAuthenticated } = useAuth()
  const { user, isLoading, error, refreshCurrentUser } = useCurrentUser()

  useEffect(() => {
    if (!isAuthenticated || user || isLoading || error) {
      return
    }

    void refreshCurrentUser().catch(() => {
      // Errors are exposed through context state.
    })
  }, [error, isAuthenticated, isLoading, refreshCurrentUser, user])

  return (
    <main className="grid min-h-full place-items-center">
      <section className="w-full rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 mt-0 text-xs font-semibold uppercase text-muted-foreground">
              Profile
            </p>
            <h1 className="m-0 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              User Profile
            </h1>
          </div>
        </div>

        {isLoading ? (
          <p className="m-0 text-sm text-muted-foreground">
            Loading user data...
          </p>
        ) : null}

        {!isLoading && error ? (
          <p className="m-0 text-sm text-destructive" role="alert">
            Unable to load user data. Please try again.
          </p>
        ) : null}

        {!isLoading && !error && user ? (
          <dl className="m-0 grid gap-3">
            <div className="grid gap-1.5 rounded-lg bg-muted px-4 py-3 sm:grid-cols-[minmax(120px,180px)_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                User ID
              </dt>
              <dd className="m-0 break-words text-sm text-foreground">
                {user.id}
              </dd>
            </div>
            <div className="grid gap-1.5 rounded-lg bg-muted px-4 py-3 sm:grid-cols-[minmax(120px,180px)_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="m-0 break-words text-sm text-foreground">
                {user.email ?? 'Unavailable'}
              </dd>
            </div>
            <div className="grid gap-1.5 rounded-lg bg-muted px-4 py-3 sm:grid-cols-[minmax(120px,180px)_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Display name
              </dt>
              <dd className="m-0 break-words text-sm text-foreground">
                {user.displayName ?? 'Unavailable'}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>
    </main>
  )
}
