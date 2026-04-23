package com.example.backend.expert.dto;

import java.util.List;

public record PaginatedExpertResponse(
    List<ExpertListingDto> items,
    Integer page,
    Integer pageSize,
    Integer totalItems,
    Integer totalPages) {
}
