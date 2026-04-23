export type MessageDeliveryState = 'SENT' | 'DELIVERED' | 'READ'

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE'

export type ConversationSummary = {
  id: number
  conversationKey: string
  createdByUserId: number
  createdAt: string
  updatedAt: string
  lastMessageAt: string | null
  otherParticipantUserId: number | null
  otherParticipantName: string
  lastMessagePreview: string | null
  unreadCount: number
}

export type MessageItem = {
  id: number
  conversationId: number
  senderUserId: number
  senderName: string
  body: string
  messageType: MessageType
  deliveryState: MessageDeliveryState
  clientMessageId: string | null
  createdAt: string
  deliveredAt: string | null
  readAt: string | null
}

export type CreateConversationPayload = {
  otherUserId: number
}

export type SendMessagePayload = {
  conversationId: number
  body: string
  clientMessageId?: string
}

export type MarkReadPayload = {
  conversationId: number
  lastReadMessageId: number
}
