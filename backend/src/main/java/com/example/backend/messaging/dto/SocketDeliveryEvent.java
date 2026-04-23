package com.example.backend.messaging.dto;

public record SocketDeliveryEvent(
    Long messageId,
    Long recipientUserId,
    Long conversationId
) {
}
