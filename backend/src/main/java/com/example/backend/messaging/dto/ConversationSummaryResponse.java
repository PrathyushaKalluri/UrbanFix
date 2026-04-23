package com.example.backend.messaging.dto;

import java.time.Instant;

public record ConversationSummaryResponse(
    Long id,
    String conversationKey,
    Long createdByUserId,
    Instant createdAt,
    Instant updatedAt,
    Instant lastMessageAt,
    Long otherParticipantUserId,
    String otherParticipantName,
    String lastMessagePreview,
    Integer unreadCount
) {
}
