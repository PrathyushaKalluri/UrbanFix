package com.example.backend.matching.dto;

import java.util.Set;

public record MatchingRequest(
    String problemText,
    Integer topN,
    Double latitude,
    Double longitude) {
}
