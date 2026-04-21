import { useEffect, useState, useRef } from 'react'
import type { ExpertListing } from '../types/expert'
import { fetchExpertCatalog } from '../services/expertCatalog'

type ExpertCatalogState = {
  experts: ExpertListing[]
  loading: boolean
  error: string | null
}

type UseAvailableExpertsOptions = {
  limit?: number
  latitude?: number
  longitude?: number
}

export function useAvailableExperts(query = '', options: UseAvailableExpertsOptions = {}): ExpertCatalogState {
  const debounceTimeout = 400 // ms
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [experts, setExperts] = useState<ExpertListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const normalizedQuery = query.trim()

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!normalizedQuery) {
      setExperts([])
      setError(null)
      setLoading(false)
      return () => {
        active = false
        controller.abort()
      }
    }

    debounceRef.current = setTimeout(() => {
      const loadExperts = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchExpertCatalog({
            query: normalizedQuery,
            limit: options.limit,
            latitude: options.latitude,
            longitude: options.longitude,
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
    }, debounceTimeout)

    return () => {
      active = false
      controller.abort()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, options.limit, options.latitude, options.longitude])

  return { experts, loading, error }
}
