import { useCurrentUser } from '../hooks/useCurrentUser'

export function ProfilePage() {
  const { user, isLoading, error } = useCurrentUser()

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-card__header">
          <div>
            <p className="profile-card__eyebrow">Profile</p>
            <h1>User Profile</h1>
          </div>
        </div>

        {isLoading ? <p>Loading user data...</p> : null}

        {!isLoading && error ? (
          <p role="alert">Unable to load user data. Please try again.</p>
        ) : null}

        {!isLoading && !error && user ? (
          <dl className="profile-details">
            <div className="profile-details__row">
              <dt>User ID</dt>
              <dd>{user.id}</dd>
            </div>
            <div className="profile-details__row">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="profile-details__row">
              <dt>Display name</dt>
              <dd>{user.displayName}</dd>
            </div>
            <div className="profile-details__row">
              <dt>Status</dt>
              <dd>{user.status}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </main>
  )
}
