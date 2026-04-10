import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApiClient } from '../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { useCurrentUser } from '../features/user/useCurrentUser'

export function ActivatePage() {
  const { getAccessTokenSilently } = useAuth()
  const { user } = useCurrentUser()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
  }, [user?.displayName])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedDisplayName = displayName.trim()

    if (!trimmedDisplayName) {
      setErrorMessage('Display name is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(undefined)

    try {
      const client = createApiClient({ getAccessTokenSilently })

      await client.request('/users/activate', {
        method: 'POST',
        body: JSON.stringify({ displayName: trimmedDisplayName }),
      })

      setDisplayName(trimmedDisplayName)
      navigate('/projects', { replace: true })
    } catch (error: unknown) {
      console.error('Failed to activate user', error)
      setErrorMessage('Unable to send activation request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="activation-page">
      <section className="activation-card">
        <p className="activation-card__eyebrow">Activation</p>
        <h1>Finish setting up your account</h1>
        <p className="activation-card__copy">
          Choose the display name you want to use in KeyVault, then submit your
          activation request.
        </p>

        <form className="activation-form" onSubmit={handleSubmit}>
          <label className="activation-form__field" htmlFor="displayName">
            <span>Display name</span>
            <input
              autoComplete="nickname"
              id="displayName"
              name="displayName"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Enter your display name"
              type="text"
              value={displayName}
              disabled={isSubmitting}
            />
          </label>

          {errorMessage ? <p role="alert">{errorMessage}</p> : null}
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Sending...' : 'Activate'}
          </button>
        </form>
      </section>
    </main>
  )
}
