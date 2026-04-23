package com.example.backend.messaging.dto;

import com.example.backend.messaging.entity.MessageDeliveryState;
import com.example.backend.messaging.entity.MessageType;
import java.time.Instant;

public record MessageResponse(
    Long id,
    Long conversationId,
    Long senderUserId,
    String senderName,
    String body,
    MessageType messageType,
    MessageDeliveryState deliveryState,
    String clientMessageId,
    Instant createdAt,
    Instant deliveredAt,
    Instant readAt
) {
}
