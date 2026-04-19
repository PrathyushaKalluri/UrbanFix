package com.example.backend.auth.dto;

import com.example.backend.auth.entity.UserRole;

public record AuthResponse(
    String token,
    String fullName,
    String email,
    UserRole role) {
}
