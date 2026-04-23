package com.example.backend.expert.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.service.CustomUserDetailsService;
import com.example.backend.auth.service.JwtService;
import com.example.backend.expert.dto.ExpertListingDto;
import com.example.backend.expert.dto.PaginatedExpertResponse;
import com.example.backend.expert.service.ExpertSearchService;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ExpertSearchController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(locations = "classpath:application-test.properties")
class ExpertSearchControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private ExpertSearchService expertSearchService;

  @MockitoBean
  private JwtService jwtService;

  @MockitoBean
  private CustomUserDetailsService customUserDetailsService;

  @Test
  void search_shouldReturnPaginatedResults() throws Exception {
    ExpertListingDto expert = new ExpertListingDto(
        1L, 1L, "Alice", "Plumbing", 5, true, "Downtown", 17.3850, 78.4867, Set.of("Plumbing"));

    when(expertSearchService.search(anyInt(), anyInt(), anyBoolean(), eq(null), eq(null), eq(null), eq(null)))
        .thenReturn(new PaginatedExpertResponse(List.of(expert), 1, 20, 1, 1));

    mockMvc.perform(get("/api/experts/search"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items").isArray())
        .andExpect(jsonPath("$.items[0].fullName").value("Alice"))
        .andExpect(jsonPath("$.items[0].primaryExpertise").value("Plumbing"))
        .andExpect(jsonPath("$.page").value(1))
        .andExpect(jsonPath("$.totalItems").value(1));
  }

  @Test
  void search_shouldPassQueryParameters() throws Exception {
    when(expertSearchService.search(1, 10, true, "plumb", 17.3850, 78.4867, 5.0))
        .thenReturn(new PaginatedExpertResponse(List.of(), 1, 10, 0, 0));

    mockMvc.perform(get("/api/experts/search")
            .param("page", "1")
            .param("pageSize", "10")
            .param("availableOnly", "true")
            .param("search", "plumb")
            .param("latitude", "17.3850")
            .param("longitude", "78.4867")
            .param("radiusKm", "5.0"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items").isEmpty())
        .andExpect(jsonPath("$.totalItems").value(0));
  }
}
