import { useCallback, useEffect, useState } from 'react'
import type { MessageItem } from '../types/messaging'
import { fetchMessages, markConversationRead, sendMessage } from '../services/messagingApi'

export function useMessages(conversationId: number | undefined, currentUserId: number | undefined, pollIntervalMs = 3000) {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      return
    }
    try {
      setError(null)
      const data = await fetchMessages(conversationId)
      setMessages((prev) => {
        // Merge to avoid flicker: keep existing messages that might not be in the response yet
        // (e.g. optimistically added), then overwrite with server state
        const map = new Map<number, MessageItem>()
        for (const m of prev) {
          if (m.id > 0) map.set(m.id, m)
        }
        for (const m of data) {
          map.set(m.id, m)
        }
        return Array.from(map.values()).sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    setLoading(true)
    load()
    const interval = setInterval(load, pollIntervalMs)
    return () => clearInterval(interval)
  }, [load, pollIntervalMs])

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
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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

  return { messages, loading, error, sending, postMessage, markRead, refresh: load }
}
