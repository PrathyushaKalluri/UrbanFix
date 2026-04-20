import { useEffect, useState } from 'react'
import type { ExpertListing } from '../types/expert'
import { fetchExpertCatalog } from '../services/expertCatalog'

type ExpertCatalogState = {
  experts: ExpertListing[]
  loading: boolean
  error: string | null
}

type UseAvailableExpertsOptions = {
  limit?: number
}

export function useAvailableExperts(query = '', options: UseAvailableExpertsOptions = {}): ExpertCatalogState {
  const [experts, setExperts] = useState<ExpertListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      setExperts([])
      setError(null)
      setLoading(false)
      return () => {
        active = false
        controller.abort()
      }
    }

    setLoading(true)

    const loadExperts = async () => {
      try {
        const data = await fetchExpertCatalog({
          query: normalizedQuery,
          limit: options.limit,
          signal: controller.signal,
        })

        if (active) {
          setExperts(data)
          setError(null)
        }
      } catch (fetchError) {
        if (active && !(fetchError instanceof DOMException && fetchError.name === 'AbortError')) {
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
      controller.abort()
    }
  }, [query, options.limit])

  return { experts, loading, error }
}