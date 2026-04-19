package com.example.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ExpertRegisterRequest(
    @NotBlank String fullName,
    @Email @NotBlank String email,
    @NotBlank String password,
    String primaryExpertise,
    Integer yearsOfExperience,
    List<String> expertiseAreas,
    List<String> workAreas,
    String bio,
    Boolean available,
    Boolean servesAsResident) {
}