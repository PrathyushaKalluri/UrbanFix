package com.example.backend.messaging.dto;

public record SocketPresenceEvent(
    Long userId,
    boolean online
) {
}
