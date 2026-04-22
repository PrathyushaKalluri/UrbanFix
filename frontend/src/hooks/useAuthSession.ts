import { useEffect, useState } from 'react'
import type { AuthProfile, AuthSession } from '../types/auth'

type AuthResponse = {
  token: string
  fullName: string
  email: string
  role: AuthProfile['role']
}

type ErrorResponse = {
  message?: string
}

export function useAuthSession(): AuthSession {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') ?? '')
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(token))

  const loadProfile = async (currentToken: string) => {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Session expired')
    }

    return response.json() as Promise<AuthProfile>
  }

  useEffect(() => {
    let active = true

    if (!token) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    const syncProfile = async () => {
      try {
        const data = await loadProfile(token)

        if (active) {
          setProfile(data)
        }
      } catch {
        if (active) {
          localStorage.removeItem('authToken')
          setToken('')
          setProfile(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    syncProfile()

    return () => {
      active = false
    }
  }, [token])

  const submitAuth: AuthSession['submitAuth'] = async (endpoint, payload) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data: unknown = await response.json()

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? (data as ErrorResponse).message ?? 'Authentication failed'
          : 'Authentication failed'
      throw new Error(message)
    }

    const authData = data as AuthResponse

    localStorage.setItem('authToken', authData.token)
    setToken(authData.token)
    setProfile({
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    })

    return authData
  }

  const refreshProfile: AuthSession['refreshProfile'] = async () => {
    if (!token) {
      return
    }

    const data = await loadProfile(token)
    setProfile(data)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken('')
    setProfile(null)
  }

  return {
    profile,
    loading,
    submitAuth,
    refreshProfile,
    logout,
  }
}
