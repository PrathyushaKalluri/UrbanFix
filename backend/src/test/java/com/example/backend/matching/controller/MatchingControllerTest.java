package com.example.backend.matching.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.service.CustomUserDetailsService;
import com.example.backend.auth.service.JwtService;
import com.example.backend.matching.dto.MatchingRequest;
import com.example.backend.matching.dto.MatchingResponse;
import com.example.backend.matching.service.MatchingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MatchingController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(locations = "classpath:application-test.properties")
class MatchingControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private MatchingService matchingService;

  @MockitoBean
  private JwtService jwtService;

  @MockitoBean
  private CustomUserDetailsService customUserDetailsService;

  @Test
  void recommendations_shouldReturnSuggestions() throws Exception {
    MatchingResponse.Suggestion suggestion = new MatchingResponse.Suggestion(
        1L, 1L, "Alice", "Plumbing", 5, true, "Downtown",
        17.3850, 78.4867, Set.of("Plumbing"), 0.85,
        Map.of("skill", 0.8, "experience", 1.0, "availability", 1.0, "location", 0.5),
        List.of("Skill overlap", "5 years experience", "Currently available", "Nearby"));

    when(matchingService.recommend(any())).thenReturn(
        new MatchingResponse("Sink leaking", List.of(suggestion)));

    MatchingRequest request = new MatchingRequest("Sink leaking", 5, 17.3850, 78.4867);

    mockMvc.perform(post("/api/matching/recommendations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.requestText").value("Sink leaking"))
        .andExpect(jsonPath("$.suggestions").isArray())
        .andExpect(jsonPath("$.suggestions[0].fullName").value("Alice"))
        .andExpect(jsonPath("$.suggestions[0].score").value(0.85));
  }

  @Test
  void recommendations_shouldReturnEmptyList_whenNoMatches() throws Exception {
    when(matchingService.recommend(any())).thenReturn(
        new MatchingResponse("Unknown problem", List.of()));

    MatchingRequest request = new MatchingRequest("Unknown problem", null, null, null);

    mockMvc.perform(post("/api/matching/recommendations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.suggestions").isEmpty());
  }
}
