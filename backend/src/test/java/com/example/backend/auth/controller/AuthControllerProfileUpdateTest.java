package com.example.backend.auth.controller;

import static org.hamcrest.Matchers.closeTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.entity.ExpertProfile;
import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.repository.ExpertProfileRepository;
import com.example.backend.auth.repository.UserRepository;
import java.util.LinkedHashSet;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerProfileUpdateTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ExpertProfileRepository expertProfileRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    expertProfileRepository.deleteAll();
    userRepository.deleteAll();

    UserAccount expert = new UserAccount("Expert User", "expert@example.com", passwordEncoder.encode("password"), UserRole.EXPERT);
    UserAccount savedExpert = userRepository.save(expert);

    expertProfileRepository.save(new ExpertProfile(
        savedExpert,
        4,
        "Plumbing",
        true,
        new LinkedHashSet<>(java.util.List.of("Plumbing", "Leak Repair")),
        "Madhapur",
        17.4483,
        78.3915));
  }

  @Test
  void updateProfileUpdatesUserAndExpertDetails() throws Exception {
    String token = mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"expert@example.com","password":"password"}
                """))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();

    JsonNode loginResponse = objectMapper.readTree(token);
    String jwt = loginResponse.get("token").asText();

    mockMvc.perform(patch("/api/auth/me")
            .header("Authorization", "Bearer " + jwt)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "fullName":"Updated Expert",
                  "email":"updated.expert@example.com",
                  "primaryExpertise":"Electrical",
                  "yearsOfExperience":6,
                  "expertiseAreas":["Electrical", "Wiring"],
                  "available":false,
                  "serviceArea":"Gachibowli"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.fullName").value("Updated Expert"))
        .andExpect(jsonPath("$.email").value("updated.expert@example.com"))
        .andExpect(jsonPath("$.primaryExpertise").value("Electrical"))
        .andExpect(jsonPath("$.yearsOfExperience").value(6))
        .andExpect(jsonPath("$.available").value(false))
        .andExpect(jsonPath("$.serviceArea").value("Gachibowli"))
        .andExpect(jsonPath("$.latitude", closeTo(17.4401, 0.0001)))
        .andExpect(jsonPath("$.longitude", closeTo(78.3489, 0.0001)))
        .andExpect(jsonPath("$.token").isNotEmpty());
  }
}