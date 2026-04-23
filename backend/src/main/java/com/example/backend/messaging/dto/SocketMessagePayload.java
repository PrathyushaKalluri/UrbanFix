package com.example.backend.messaging.dto;

public record SocketMessagePayload(
    Long conversationId,
    String body,
    String clientMessageId
) {
}
