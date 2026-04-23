package com.example.backend.expert.dto;

import java.util.Set;

public record ExpertListingDto(
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
