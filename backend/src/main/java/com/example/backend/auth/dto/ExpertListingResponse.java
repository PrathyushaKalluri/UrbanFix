package com.example.backend.auth.dto;

import java.util.Set;

public record ExpertListingResponse(
    Long expertId,
    Long userId,
    String fullName,
    String primaryExpertise,
    Integer yearsOfExperience,
    Boolean available,
    String serviceArea,
    Double latitude,
    Double longitude,
    Set<String> expertiseAreas) {
}