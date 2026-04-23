import { useEffect, useState } from 'react'
import type { ConversationSummary } from '../types/messaging'
import { fetchConversations } from '../services/messagingApi'

export function useConversations(pollIntervalMs = 10000) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const data = await fetchConversations()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, pollIntervalMs)
    return () => clearInterval(interval)
  }, [pollIntervalMs])

  return { conversations, loading, error, refresh: load }
}
