import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs'
import type { MessageItem } from '../types/messaging'

export type MessageHandler = (message: MessageItem) => void
export type DeliveryHandler = (event: { messageId: number; recipientUserId: number; conversationId: number }) => void
export type ReadHandler = (event: { messageId: number; recipientUserId: number; conversationId: number }) => void

export interface ConversationHandlers {
  onMessage?: MessageHandler
  onDelivery?: DeliveryHandler
  onRead?: ReadHandler
}

let client: Client | null = null
let disconnectTimer: ReturnType<typeof setTimeout> | null = null
const topicSubscriptions = new Map<string, StompSubscription>()
const handlerRegistry = new Map<string, Set<ConversationHandlers>>()

const DISCONNECT_DELAY_MS = 3000

function getToken(): string | null {
  return localStorage.getItem('authToken')
}

function getTopicKey(conversationId: number, suffix?: string): string {
  return suffix
    ? `/topic/conversations/${conversationId}/${suffix}`
    : `/topic/conversations/${conversationId}`
}

function dispatchMessage(topic: string, body: unknown) {
  const handlers = handlerRegistry.get(topic)
  if (!handlers) return
  for (const h of handlers) {
    if (topic.endsWith('/delivery') && h.onDelivery) {
      h.onDelivery(body as { messageId: number; recipientUserId: number; conversationId: number })
    } else if (topic.endsWith('/read') && h.onRead) {
      h.onRead(body as { messageId: number; recipientUserId: number; conversationId: number })
    } else if (h.onMessage) {
      h.onMessage(body as MessageItem)
    }
  }
}

function ensureTopicSubscribed(topic: string): void {
  if (!client || !client.connected) return
  if (topicSubscriptions.has(topic)) return

  const sub = client.subscribe(topic, (message: IMessage) => {
    const body = JSON.parse(message.body)
    dispatchMessage(topic, body)
  })
  topicSubscriptions.set(topic, sub)
}

function cleanupTopicIfEmpty(topic: string): void {
  const handlers = handlerRegistry.get(topic)
  if (!handlers || handlers.size === 0) {
    handlerRegistry.delete(topic)
    const sub = topicSubscriptions.get(topic)
    if (sub) {
      sub.unsubscribe()
      topicSubscriptions.delete(topic)
    }
  }
}

function ensureConnected(): void {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer)
    disconnectTimer = null
  }
  if (client?.active) {
    return
  }

  const token = getToken()
  if (!token) return

  client = new Client({
    brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: import.meta.env.DEV ? console.log : () => {},
    onConnect: () => {
      for (const topic of handlerRegistry.keys()) {
        ensureTopicSubscribed(topic)
      }
    },
    onStompError: (frame: IFrame) => {
      console.error('Broker reported error:', frame.headers.message)
      console.error('Additional details:', frame.body)
    },
    onWebSocketError: (event: Event) => {
      console.error('WebSocket error:', event)
    },
  })

  client.activate()
}

function scheduleDisconnect(): void {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer)
  }
  disconnectTimer = setTimeout(() => {
    if (handlerRegistry.size === 0) {
      for (const sub of topicSubscriptions.values()) {
        sub.unsubscribe()
      }
      topicSubscriptions.clear()
      client?.deactivate()
      client = null
    }
  }, DISCONNECT_DELAY_MS)
}

export function getConnectionState(): 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' {
  if (!client) return 'DISCONNECTED'
  if (client.active && client.connected) return 'CONNECTED'
  if (client.active) return 'CONNECTING'
  return 'DISCONNECTED'
}

export function subscribeToConversation(
  conversationId: number,
  handlers: ConversationHandlers
): () => void {
  ensureConnected()

  const topics = [
    getTopicKey(conversationId),
    getTopicKey(conversationId, 'delivery'),
    getTopicKey(conversationId, 'read'),
  ]

  for (const topic of topics) {
    if (!handlerRegistry.has(topic)) {
      handlerRegistry.set(topic, new Set())
    }
    handlerRegistry.get(topic)!.add(handlers)
    ensureTopicSubscribed(topic)
  }

  return () => {
    for (const topic of topics) {
      handlerRegistry.get(topic)?.delete(handlers)
      cleanupTopicIfEmpty(topic)
    }
    scheduleDisconnect()
  }
}

export function sendMessageViaSocket(payload: {
  conversationId: number
  body: string
  clientMessageId: string
}): void {
  ensureConnected()
  if (!client || !client.connected) {
    throw new Error('WebSocket not connected')
  }
  client.publish({
    destination: '/app/messages.send',
    body: JSON.stringify(payload),
  })
}
