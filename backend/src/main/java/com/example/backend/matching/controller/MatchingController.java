package com.example.backend.matching.controller;

import com.example.backend.matching.dto.MatchingRequest;
import com.example.backend.matching.dto.MatchingResponse;
import com.example.backend.matching.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

  private final MatchingService matchingService;

  public MatchingController(MatchingService matchingService) {
    this.matchingService = matchingService;
  }

  @PostMapping("/recommendations")
  public MatchingResponse recommendations(@Valid @RequestBody MatchingRequest request) {
    return matchingService.recommend(request);
  }
}
