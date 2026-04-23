package com.example.backend.messaging.dto;

public record SocketReadEvent(
    Long messageId,
    Long recipientUserId,
    Long conversationId
) {
}
