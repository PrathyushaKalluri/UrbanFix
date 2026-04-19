package com.example.backend.auth.service;

import com.example.backend.auth.dto.AuthResponse;
import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.RegisterRequest;
import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.repository.UserRepository;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

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
    String token = jwtService.generateToken(savedUser, Map.of("role", savedUser.getRole().name()));
    return new AuthResponse(token, savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole());
  }

  public AuthResponse login(LoginRequest request) {
    String normalizedEmail = request.email().toLowerCase();

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));

    UserAccount user = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new IllegalArgumentException("Invalid login credentials"));

    String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
    return new AuthResponse(token, user.getFullName(), user.getEmail(), user.getRole());
  }
}
