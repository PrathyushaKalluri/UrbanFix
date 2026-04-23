package com.example.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record UpdateProfileRequest(
    @NotBlank String fullName,
    @Email @NotBlank String email,
    String primaryExpertise,
    Integer yearsOfExperience,
    List<String> expertiseAreas,
    Boolean available,
    String serviceArea,
    Double latitude,
    Double longitude) {
}