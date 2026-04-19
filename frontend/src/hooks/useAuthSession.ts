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

  useEffect(() => {
    let active = true

    if (!token) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Session expired')
        }

        const data: AuthProfile = await response.json()

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

    loadProfile()

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

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken('')
    setProfile(null)
  }

  return {
    profile,
    loading,
    submitAuth,
    logout,
  }
}
