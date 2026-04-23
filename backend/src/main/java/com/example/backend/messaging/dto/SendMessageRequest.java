package com.example.backend.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
    @NotNull
    Long conversationId,

    @NotBlank
    @Size(max = 4000)
    String body,

    String clientMessageId
) {
}
