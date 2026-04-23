import { useCallback, useEffect, useRef, useState } from 'react'
import type { MessageItem } from '../types/messaging'
import { fetchMessages, markConversationRead, sendMessage } from '../services/messagingApi'
import {
  getConnectionState,
  subscribeToConversation,
} from '../services/webSocketService'

export function useMessages(
  conversationId: number | undefined,
  currentUserId: number | undefined,
  pollIntervalMs = 3000
) {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const tokenRef = useRef<string>(localStorage.getItem('authToken') ?? '')

  const load = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      return
    }
    try {
      setError(null)
      const data = await fetchMessages(conversationId)
      setMessages((prev) => {
        const map = new Map<string | number, MessageItem>()
        for (const m of data) {
          map.set(m.id, m)
        }
        for (const m of prev) {
          if (m.id < 0 && !map.has(m.clientMessageId ?? '')) {
            map.set(m.clientMessageId ?? m.id, m)
          }
        }
        return Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  // REST bootstrap + polling fallback
  useEffect(() => {
    setLoading(true)
    load()
    const effectivePoll = wsConnected ? Math.max(pollIntervalMs * 3, 10000) : pollIntervalMs
    const interval = setInterval(load, effectivePoll)
    return () => clearInterval(interval)
  }, [load, pollIntervalMs, wsConnected])

  // WebSocket subscription
  useEffect(() => {
    if (!conversationId || !currentUserId) return

    const token = localStorage.getItem('authToken')
    if (!token) return
    tokenRef.current = token

    const checkInterval = setInterval(() => {
      setWsConnected(getConnectionState() === 'CONNECTED')
    }, 1000)

    const unsubscribe = subscribeToConversation(conversationId, {
      onMessage: (msg) => {
        setMessages((prev) => {
          if (msg.senderUserId === currentUserId && msg.clientMessageId) {
            const existing = prev.find((m) => m.clientMessageId === msg.clientMessageId)
            if (existing) {
              return prev
                .map((m) => (m.clientMessageId === msg.clientMessageId ? msg : m))
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
            }
          }
          if (prev.some((m) => m.id === msg.id)) {
            return prev.map((m) => (m.id === msg.id ? msg : m))
          }
          return [...prev, msg].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })
      },
      onDelivery: (event) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === event.messageId
              ? { ...m, deliveryState: 'DELIVERED' as const, deliveredAt: new Date().toISOString() }
              : m
          )
        )
      },
      onRead: (event) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === event.messageId
              ? {
                  ...m,
                  deliveryState: 'READ' as const,
                  deliveredAt: m.deliveredAt ?? new Date().toISOString(),
                  readAt: new Date().toISOString(),
                }
              : m
          )
        )
      },
    })

    return () => {
      clearInterval(checkInterval)
      unsubscribe()
    }
  }, [conversationId, currentUserId])

  const postMessage = useCallback(
    async (body: string) => {
      if (!conversationId || !body.trim()) return
      const clientMessageId = `${conversationId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const optimistic: MessageItem = {
        id: -Date.now(),
        conversationId,
        senderUserId: currentUserId ?? 0,
        senderName: 'You',
        body: body.trim(),
        messageType: 'TEXT',
        deliveryState: 'SENT',
        clientMessageId,
        createdAt: new Date().toISOString(),
        deliveredAt: null,
        readAt: null,
      }
      setMessages((prev) => [...prev, optimistic])
      setSending(true)
      try {
        const sent = await sendMessage({
          conversationId,
          body: body.trim(),
          clientMessageId,
        })
        setMessages((prev) =>
          prev
            .map((m) => (m.clientMessageId === clientMessageId ? sent : m))
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
        )
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...m, deliveryState: 'SENT' as const, body: `${m.body} [failed to send]` }
              : m
          )
        )
        throw err
      } finally {
        setSending(false)
      }
    },
    [conversationId, currentUserId]
  )

  const markRead = useCallback(
    async (lastReadMessageId: number) => {
      if (!conversationId) return
      await markConversationRead({ conversationId, lastReadMessageId })
    },
    [conversationId]
  )

  return { messages, loading, error, sending, wsConnected, postMessage, markRead, refresh: load }
}
