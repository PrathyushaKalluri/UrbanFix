package com.example.backend.auth.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateAvailabilityRequest(
    @NotNull Boolean available) {
}