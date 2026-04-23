package com.example.backend.messaging.dto;

import jakarta.validation.constraints.NotNull;

public record CreateConversationRequest(
    @NotNull
    Long otherUserId
) {
}
