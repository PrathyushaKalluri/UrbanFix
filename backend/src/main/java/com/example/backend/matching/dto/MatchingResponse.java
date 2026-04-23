package com.example.backend.matching.dto;

import java.util.List;
import java.util.Map;
import java.util.Set;

public record MatchingResponse(
    String requestText,
    List<Suggestion> suggestions) {

  public record Suggestion(
      Long expertId,
      Long userId,
      String fullName,
      String primaryExpertise,
      Integer yearsOfExperience,
      Boolean available,
      String serviceArea,
      Double latitude,
      Double longitude,
      Set<String> expertiseAreas,
      Double score,
      Map<String, Double> breakdown,
      List<String> reasons) {
  }
}
