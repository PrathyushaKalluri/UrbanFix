import { useEffect, useState } from 'react'
import type { ExpertListing } from '../types/expert'

type ExpertCatalogState = {
  experts: ExpertListing[]
  loading: boolean
  error: string | null
}

export function useAvailableExperts(): ExpertCatalogState {
  const [experts, setExperts] = useState<ExpertListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('authToken')

    const loadExperts = async () => {
      try {
        const response = await fetch('/api/experts/all', {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        })

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('The expert directory is temporarily unavailable for this session.')
          }

          if (response.status === 404) {
            throw new Error('The expert directory endpoint is not available yet.')
          }

          throw new Error(`Unable to load experts (${response.status})`)
        }

        const data = (await response.json()) as ExpertListing[]

        if (active) {
          setExperts(data)
          setError(null)
        }
      } catch (fetchError) {
        if (active) {
          setExperts([])
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load experts')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadExperts()

    return () => {
      active = false
    }
  }, [])

  return { experts, loading, error }
}