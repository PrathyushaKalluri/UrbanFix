package com.example.backend.auth.controller;

import com.example.backend.auth.dto.AuthResponse;
import com.example.backend.auth.dto.ExpertRegisterRequest;
import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.RegisterRequest;
import com.example.backend.auth.dto.UpdateAvailabilityRequest;
import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register/user")
  public AuthResponse registerUser(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request, UserRole.USER);
  }

  @PostMapping("/register/expert")
  public AuthResponse registerExpert(@Valid @RequestBody ExpertRegisterRequest request) {
    return authService.registerExpert(request);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  public Map<String, Object> me(Authentication authentication) {
    UserAccount user = (UserAccount) authentication.getPrincipal();
    return authService.getCurrentUserProfile(user);
  }

  @PatchMapping("/me/availability")
  public Map<String, Object> updateAvailability(
      Authentication authentication,
      @Valid @RequestBody UpdateAvailabilityRequest request) {
    UserAccount user = (UserAccount) authentication.getPrincipal();
    return authService.updateExpertAvailability(user, request.available());
  }
}
