package com.example.backend.messaging.dto;

import jakarta.validation.constraints.NotNull;

public record MarkReadRequest(
    @NotNull
    Long conversationId,

    @NotNull
    Long lastReadMessageId
) {
}
