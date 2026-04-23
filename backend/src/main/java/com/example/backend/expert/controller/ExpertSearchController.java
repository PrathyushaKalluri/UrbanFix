package com.example.backend.expert.controller;

import com.example.backend.expert.dto.PaginatedExpertResponse;
import com.example.backend.expert.service.ExpertSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/experts")
public class ExpertSearchController {

  private final ExpertSearchService expertSearchService;

  public ExpertSearchController(ExpertSearchService expertSearchService) {
    this.expertSearchService = expertSearchService;
  }

  @GetMapping("/search")
  public PaginatedExpertResponse search(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(defaultValue = "false") boolean availableOnly,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Double latitude,
      @RequestParam(required = false) Double longitude,
      @RequestParam(required = false) Double radiusKm) {
    return expertSearchService.search(page, pageSize, availableOnly, search, latitude, longitude, radiusKm);
  }
}
