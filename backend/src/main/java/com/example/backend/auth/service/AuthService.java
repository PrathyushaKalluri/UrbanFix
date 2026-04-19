package com.example.backend.auth.service;

import com.example.backend.auth.dto.AuthResponse;
import com.example.backend.auth.dto.ExpertRegisterRequest;
import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.RegisterRequest;
import com.example.backend.auth.entity.ExpertProfile;
import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.repository.ExpertProfileRepository;
import com.example.backend.auth.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final ExpertProfileRepository expertProfileRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository,
      ExpertProfileRepository expertProfileRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtService jwtService) {
    this.userRepository = userRepository;
    this.expertProfileRepository = expertProfileRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request, UserRole role) {
    String normalizedEmail = request.email().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
      throw new IllegalArgumentException("Email is already registered");
    }

    UserAccount user = new UserAccount(
        request.fullName(),
        normalizedEmail,
        passwordEncoder.encode(request.password()),
        role);

    UserAccount savedUser = userRepository.save(user);
    return buildAuthResponse(savedUser);
  }

  @Transactional
  public AuthResponse registerExpert(ExpertRegisterRequest request) {
    String normalizedEmail = request.email().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
      throw new IllegalArgumentException("Email is already registered");
    }

    UserAccount expertUser = new UserAccount(
        request.fullName(),
        normalizedEmail,
        passwordEncoder.encode(request.password()),
        UserRole.EXPERT);

    UserAccount savedUser = userRepository.save(expertUser);

    String primaryExpertise = normalizePrimaryExpertise(request.primaryExpertise());
    int yearsOfExperience = normalizeYearsOfExperience(request.yearsOfExperience());
    Set<String> expertiseAreas = normalizeValues(request.expertiseAreas(), primaryExpertise);
    boolean available = request.available() == null ? true : request.available();
    boolean servesAsResident = request.servesAsResident() == null ? true : request.servesAsResident();

    ExpertProfile expertProfile = new ExpertProfile(
        savedUser,
      yearsOfExperience,
      primaryExpertise,
        request.bio(),
      available,
      servesAsResident,
        expertiseAreas);

    expertProfileRepository.save(expertProfile);

    return buildAuthResponse(savedUser);
  }

  public AuthResponse login(LoginRequest request) {
    String normalizedEmail = request.email().toLowerCase();

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));

    UserAccount user = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new IllegalArgumentException("Invalid login credentials"));

    return buildAuthResponse(user);
  }

  public Map<String, Object> getCurrentUserProfile(UserAccount user) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("fullName", user.getFullName());
    response.put("email", user.getEmail());
    response.put("role", user.getRole().name());

    if (user.getRole() == UserRole.EXPERT) {
      expertProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
        response.put("primaryExpertise", profile.getPrimaryExpertise());
        response.put("yearsOfExperience", profile.getYearsOfExperience());
        response.put("expertiseAreas", profile.getExpertiseAreas());
        response.put("available", profile.getAvailable());
        response.put("servesAsResident", profile.getServesAsResident());
      });
    }

    return response;
  }

  private AuthResponse buildAuthResponse(UserAccount user) {
    String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
    return new AuthResponse(token, user.getFullName(), user.getEmail(), user.getRole());
  }

  private String normalizePrimaryExpertise(String primaryExpertise) {
    if (primaryExpertise == null || primaryExpertise.isBlank()) {
      return "General Services";
    }
    return primaryExpertise.trim();
  }

  private int normalizeYearsOfExperience(Integer yearsOfExperience) {
    if (yearsOfExperience == null) {
      return 0;
    }
    return Math.max(0, yearsOfExperience);
  }

  private Set<String> normalizeValues(List<String> values, String fallback) {
    if (values == null || values.isEmpty()) {
      return Set.of(fallback);
    }

    Set<String> normalized = values.stream()
        .filter(value -> value != null && !value.isBlank())
        .map(String::trim)
        .collect(Collectors.toCollection(LinkedHashSet::new));

    if (normalized.isEmpty()) {
      return Set.of(fallback);
    }

    return normalized;
  }
}
