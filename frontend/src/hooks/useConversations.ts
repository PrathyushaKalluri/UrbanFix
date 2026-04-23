import { useEffect, useRef, useState } from 'react'
import type { ConversationSummary } from '../types/messaging'
import { fetchConversations } from '../services/messagingApi'
import {
  getConnectionState,
  subscribeToConversation,
} from '../services/webSocketService'

export function useConversations(pollIntervalMs = 10000) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const subscribedIdsRef = useRef<Set<number>>(new Set())
  const unsubscribesRef = useRef<Map<number, () => void>>(new Map())

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

  // WebSocket: subscribe to conversation topics for real-time list updates
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const checkInterval = setInterval(() => {
      setWsConnected(getConnectionState() === 'CONNECTED')
    }, 1000)

    const currentIds = new Set(conversations.map((c) => c.id))

    // Subscribe to new conversations
    for (const id of currentIds) {
      if (!subscribedIdsRef.current.has(id)) {
        const unsub = subscribeToConversation(id, {
          onMessage: () => load(),
          onDelivery: () => load(),
          onRead: () => load(),
        })
        subscribedIdsRef.current.add(id)
        unsubscribesRef.current.set(id, unsub)
      }
    }

    // Unsubscribe from removed conversations
    for (const id of subscribedIdsRef.current) {
      if (!currentIds.has(id)) {
        unsubscribesRef.current.get(id)?.()
        unsubscribesRef.current.delete(id)
        subscribedIdsRef.current.delete(id)
      }
    }

    return () => {
      clearInterval(checkInterval)
    }
  }, [conversations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const unsub of unsubscribesRef.current.values()) {
        unsub()
      }
      subscribedIdsRef.current.clear()
      unsubscribesRef.current.clear()
    }
  }, [])

  return { conversations, loading, error, wsConnected, refresh: load }
}
