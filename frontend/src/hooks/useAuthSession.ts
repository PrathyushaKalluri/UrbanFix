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

type ProfileResponse = AuthProfile & {
  token?: string
}

const readResponseData = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text ? { message: text } : null
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

const normalizeProfile = (data: unknown): AuthProfile => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid profile payload')
  }

  const profile = data as Record<string, unknown>

  return {
    id: Number(profile.id ?? 0),
    fullName: String(profile.fullName ?? ''),
    email: String(profile.email ?? ''),
    role: profile.role === 'EXPERT' ? 'EXPERT' : 'USER',
    primaryExpertise: typeof profile.primaryExpertise === 'string' ? profile.primaryExpertise : undefined,
    yearsOfExperience: typeof profile.yearsOfExperience === 'number' ? profile.yearsOfExperience : undefined,
    expertiseAreas: Array.isArray(profile.expertiseAreas)
      ? profile.expertiseAreas.filter((item): item is string => typeof item === 'string')
      : undefined,
    available: typeof profile.available === 'boolean' ? profile.available : undefined,
    serviceArea: typeof profile.serviceArea === 'string' ? profile.serviceArea : undefined,
    latitude: typeof profile.latitude === 'number' ? profile.latitude : profile.latitude === null ? null : undefined,
    longitude: typeof profile.longitude === 'number' ? profile.longitude : profile.longitude === null ? null : undefined,
    avgRating: typeof profile.avgRating === 'number' ? profile.avgRating : undefined,
    totalJobs: typeof profile.totalJobs === 'number' ? profile.totalJobs : undefined,
    acceptanceRate: typeof profile.acceptanceRate === 'number' ? profile.acceptanceRate : undefined,
    completionRate: typeof profile.completionRate === 'number' ? profile.completionRate : undefined,
    cancellationRate: typeof profile.cancellationRate === 'number' ? profile.cancellationRate : undefined,
    avgResponseTimeSec: typeof profile.avgResponseTimeSec === 'number' ? profile.avgResponseTimeSec : undefined,
  }
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

    const data: unknown = await response.json()
    return normalizeProfile(data)
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

    const data: unknown = await readResponseData(response)

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
    setProfile(await loadProfile(authData.token))

    return authData
  }

  const updateProfile: AuthSession['updateProfile'] = async (payload) => {
    if (!token) {
      throw new Error('Session expired')
    }

    const response = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data: unknown = await readResponseData(response)

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? (data as ErrorResponse).message ?? 'Profile update failed'
          : response.status === 403
            ? 'Profile update is forbidden. Make sure the Spring Boot backend was restarted after the PATCH endpoint change.'
            : 'Profile update failed'
      throw new Error(message)
    }

    const profileResponse = data as ProfileResponse
    const nextToken = profileResponse.token ?? token

    if (profileResponse.token) {
      localStorage.setItem('authToken', profileResponse.token)
      setToken(profileResponse.token)
    }

    const nextProfile = await loadProfile(nextToken)
    setProfile(nextProfile)
    return nextProfile
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
    updateProfile,
    refreshProfile,
    logout,
  }
}
