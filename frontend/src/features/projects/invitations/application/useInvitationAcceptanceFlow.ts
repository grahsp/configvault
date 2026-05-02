import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCurrentUser } from '../../../users'
import { useAuth } from '../../../../shared/hooks/useAuth.ts'
import { getErrorMessage, isNotFoundError } from '../../domain'
import { useAcceptInvitation } from './useAcceptInvitation.ts'

interface InvitationAcceptanceFlowResult {
  actionLabel: string
  actionVisible: boolean
  errorMessage: string | null
  errorTitle: string | null
  invitePath: string
  isInvalidLink: boolean
  statusMessage: string
  statusTitle: string
  triggerLogin: () => Promise<void>
}

export function useInvitationAcceptanceFlow(): InvitationAcceptanceFlowResult {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth()
  const { refreshCurrentUser } = useCurrentUser()
  const { token } = useParams()
  const invitePath = `${location.pathname}${location.search}`
  const acceptInvitationMutation = useAcceptInvitation()
  const hasTriggeredLoginRef = useRef(false)
  const hasStartedAcceptRef = useRef(false)
  const isInvalidLink = !token

  async function triggerLogin() {
    await login({
      returnTo: invitePath,
    })
  }

  useEffect(() => {
    if (
      isInvalidLink ||
      isAuthLoading ||
      isAuthenticated ||
      hasTriggeredLoginRef.current
    ) {
      return
    }

    hasTriggeredLoginRef.current = true
    triggerLogin().catch(() => {
      hasTriggeredLoginRef.current = false
    })
  }, [invitePath, isAuthenticated, isAuthLoading, isInvalidLink, login])

  useEffect(() => {
    if (
      !isAuthenticated ||
      isInvalidLink ||
      !token ||
      acceptInvitationMutation.isPending ||
      acceptInvitationMutation.isSuccess ||
      hasStartedAcceptRef.current
    ) {
      return
    }

    hasStartedAcceptRef.current = true
    acceptInvitationMutation.mutate(
      { token },
      {
        onSuccess: async ({ projectId }) => {
          await refreshCurrentUser()
          navigate(`/projects/${projectId}`, { replace: true })
        },
      },
    )
  }, [
    acceptInvitationMutation,
    isAuthenticated,
    isInvalidLink,
    navigate,
    refreshCurrentUser,
    token,
  ])

  if (isInvalidLink) {
    return {
      actionLabel: 'Back to home',
      actionVisible: false,
      errorMessage: 'This invitation link is missing the invitation token required to accept it.',
      errorTitle: 'Invitation link is invalid',
      invitePath,
      isInvalidLink,
      statusMessage: '',
      statusTitle: '',
      triggerLogin,
    }
  }

  if (acceptInvitationMutation.isError) {
    return {
      actionLabel: 'Back to home',
      actionVisible: false,
      errorMessage: getErrorMessage(
        acceptInvitationMutation.error,
        'Something went wrong while accepting this invitation.',
      ),
      errorTitle: isNotFoundError(acceptInvitationMutation.error)
        ? 'Invitation is no longer valid'
        : 'Invitation could not be accepted',
      invitePath,
      isInvalidLink,
      statusMessage: '',
      statusTitle: '',
      triggerLogin,
    }
  }

  return {
    actionLabel: 'Continue',
    actionVisible: !isAuthenticated && !isAuthLoading,
    errorMessage: null,
    errorTitle: null,
    invitePath,
    isInvalidLink,
    statusMessage:
      isAuthLoading || !isAuthenticated
        ? 'Redirecting you to sign in before accepting the invitation.'
        : 'Accepting your invitation and opening the project.',
    statusTitle: 'Joining project',
    triggerLogin,
  }
}
