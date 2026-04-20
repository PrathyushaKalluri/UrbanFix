package com.example.backend.auth.dto;

import java.util.Set;

public record ExpertListingResponse(
    Long expertId,
    Long userId,
    String fullName,
    String primaryExpertise,
    Integer yearsOfExperience,
    String bio,
    Boolean available,
    Boolean servesAsResident,
    Set<String> expertiseAreas) {
}