import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ApiError, adminAuthApi, onUnauthorized } from '@/services/api'
import { tokenStorage } from './tokenStorage'
import type { AuthState, LoginCredentials } from '@/types'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  const clearSession = useCallback(() => {
    tokenStorage.clearToken()
    queryClient.clear()
    setState({ status: 'unauthenticated', user: null })
  }, [queryClient])

  const handleUnauthorized = useCallback(() => {
    clearSession()
    if (window.location.pathname !== '/login') {
      navigate('/login', { replace: true, state: { reason: 'session-expired' } })
    }
  }, [clearSession, navigate])

  useEffect(() => onUnauthorized(handleUnauthorized), [handleUnauthorized])

  useEffect(() => {
    let active = true
    const token = tokenStorage.getToken()

    if (!token) {
      setState({ status: 'unauthenticated', user: null })
      return () => { active = false }
    }

    adminAuthApi.me()
      .then(({ user }) => {
        if (!active) return
        if (!user.isAdmin) {
          clearSession()
          return
        }
        setState({ status: 'authenticated', user })
      })
      .catch((error: unknown) => {
        if (!active) return
        clearSession()
        if (error instanceof ApiError && error.status === 403) {
          setState({ status: 'forbidden', user: null })
        }
      })

    return () => { active = false }
  }, [clearSession])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState({ status: 'loading', user: null })
    try {
      const response = await adminAuthApi.login(credentials)
      if (!response.user.isAdmin) {
        clearSession()
        throw new ApiError('Admin access required', 403, { code: 'ADMIN_ACCESS_REQUIRED' })
      }
      tokenStorage.setToken(response.token)
      setState({ status: 'authenticated', user: response.user })
    } catch (error) {
      tokenStorage.clearToken()
      queryClient.clear()
      setState({ status: 'unauthenticated', user: null })
      throw error
    }
  }, [clearSession, queryClient])

  const logout = useCallback(() => {
    clearSession()
    navigate('/login', { replace: true })
  }, [clearSession, navigate])

  const value = useMemo(() => ({
    ...state,
    isLoading: state.status === 'loading',
    isAuthenticated: state.status === 'authenticated',
    login,
    logout,
  }), [login, logout, state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
