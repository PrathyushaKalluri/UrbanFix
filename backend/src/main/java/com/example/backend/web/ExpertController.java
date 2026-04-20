package com.example.backend.web;

import com.example.backend.auth.dto.ExpertListingResponse;
import com.example.backend.auth.service.AuthService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/experts")
public class ExpertController {

  private final AuthService authService;

  public ExpertController(AuthService authService) {
    this.authService = authService;
  }

  @GetMapping("/all")
  public List<ExpertListingResponse> allExperts() {
    return authService.getAllExperts();
  }
}