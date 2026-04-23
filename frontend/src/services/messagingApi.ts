import type {
  ConversationSummary,
  CreateConversationPayload,
  MarkReadPayload,
  MessageItem,
  SendMessagePayload,
} from '../types/messaging'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = await response.clone().json()
      message = data.message ?? data.error ?? message
    } catch {
      const text = await response.text()
      message = text || message
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const response = await fetch('/api/messages/conversations', {
    headers: {
      ...getAuthHeaders(),
    },
  })
  return handleResponse<ConversationSummary[]>(response)
}

export async function fetchOrCreateConversationWithExpert(
  expertUserId: number
): Promise<{ conversationId: number; conversationKey: string; createdAt: string }> {
  const response = await fetch(`/api/messages/conversations/with-expert/${expertUserId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  return handleResponse<{ conversationId: number; conversationKey: string; createdAt: string }>(response)
}

export async function fetchMessages(conversationId: number): Promise<MessageItem[]> {
  const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  return handleResponse<MessageItem[]>(response)
}

export async function sendMessage(payload: SendMessagePayload): Promise<MessageItem> {
  const response = await fetch(`/api/messages/conversations/${payload.conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<MessageItem>(response)
}

export async function markConversationRead(payload: MarkReadPayload): Promise<{ status: string }> {
  const response = await fetch(`/api/messages/conversations/${payload.conversationId}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<{ status: string }>(response)
}
