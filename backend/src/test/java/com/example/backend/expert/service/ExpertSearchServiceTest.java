package com.example.backend.expert.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.example.backend.auth.entity.ExpertProfile;
import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.repository.ExpertProfileRepository;
import com.example.backend.expert.dto.ExpertListingDto;
import com.example.backend.expert.dto.PaginatedExpertResponse;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpertSearchServiceTest {

  @Mock
  private ExpertProfileRepository expertProfileRepository;

  @InjectMocks
  private ExpertSearchService expertSearchService;

  private ExpertProfile profile(String name, String primary, int years, boolean available,
      Set<String> areas, String serviceArea, Double lat, Double lon) {
    UserAccount user = new UserAccount(name, name.toLowerCase() + "@test.com", "pass", UserRole.EXPERT);
    return new ExpertProfile(user, years, primary, available, areas, serviceArea, lat, lon);
  }

  @Test
  void search_shouldReturnAllExperts_whenNoFilters() {
    ExpertProfile p1 = profile("Alice", "Plumbing", 5, true, Set.of("Plumbing"), "A", null, null);
    ExpertProfile p2 = profile("Bob", "Electrical", 3, false, Set.of("Electrical"), "B", null, null);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(p1, p2));

    PaginatedExpertResponse response = expertSearchService.search(1, 20, false, null, null, null, null);

    assertThat(response.items()).hasSize(2);
    assertThat(response.totalItems()).isEqualTo(2);
    assertThat(response.totalPages()).isEqualTo(1);
  }

  @Test
  void search_shouldFilterByAvailability() {
    ExpertProfile available = profile("Alice", "Plumbing", 5, true, Set.of("Plumbing"), "A", null, null);
    ExpertProfile unavailable = profile("Bob", "Electrical", 3, false, Set.of("Electrical"), "B", null, null);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(available, unavailable));

    PaginatedExpertResponse response = expertSearchService.search(1, 20, true, null, null, null, null);

    assertThat(response.items()).hasSize(1);
    assertThat(response.items().get(0).fullName()).isEqualTo("Alice");
  }

  @Test
  void search_shouldFilterByTextSearch() {
    ExpertProfile plumber = profile("Alice", "Plumbing", 5, true, Set.of("Plumbing"), "Downtown", null, null);
    ExpertProfile electrician = profile("Bob", "Electrical", 3, true, Set.of("Electrical"), "Uptown", null, null);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(plumber, electrician));

    PaginatedExpertResponse response = expertSearchService.search(1, 20, false, "electrical", null, null, null);

    assertThat(response.items()).hasSize(1);
    assertThat(response.items().get(0).primaryExpertise()).isEqualTo("Electrical");
  }

  @Test
  void search_shouldFilterByGeoRadius() {
    ExpertProfile nearby = profile("Alice", "Plumbing", 5, true, Set.of("Plumbing"), "Downtown", 17.3850, 78.4867);
    ExpertProfile far = profile("Bob", "Electrical", 3, true, Set.of("Electrical"), "Faraway", 18.0, 79.0);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(nearby, far));

    PaginatedExpertResponse response = expertSearchService.search(1, 20, false, null, 17.3850, 78.4867, 10.0);

    assertThat(response.items()).hasSize(1);
    assertThat(response.items().get(0).fullName()).isEqualTo("Alice");
  }

  @Test
  void search_shouldPaginateResults() {
    ExpertProfile p1 = profile("A", "Plumbing", 1, true, Set.of("Plumbing"), "A", null, null);
    ExpertProfile p2 = profile("B", "Plumbing", 2, true, Set.of("Plumbing"), "B", null, null);
    ExpertProfile p3 = profile("C", "Plumbing", 3, true, Set.of("Plumbing"), "C", null, null);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(p1, p2, p3));

    PaginatedExpertResponse page1 = expertSearchService.search(1, 2, false, null, null, null, null);
    assertThat(page1.items()).hasSize(2);
    assertThat(page1.totalPages()).isEqualTo(2);
    assertThat(page1.page()).isEqualTo(1);

    PaginatedExpertResponse page2 = expertSearchService.search(2, 2, false, null, null, null, null);
    assertThat(page2.items()).hasSize(1);
    assertThat(page2.page()).isEqualTo(2);
  }

  @Test
  void search_shouldPreferPrimaryExpertiseMatch_whenSearchProvided() {
    ExpertProfile hvacWithPlumbing = profile("HVACExpert", "HVAC", 8, true,
        Set.of("Plumbing", "Installation", "Repair"), "Madhapur", null, null);
    ExpertProfile plumber = profile("PlumbingExpert", "Plumbing", 6, true,
        Set.of("Plumbing", "Leak Fix", "Repair"), "Madhapur", null, null);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(hvacWithPlumbing, plumber));

    PaginatedExpertResponse response = expertSearchService.search(1, 20, false, "plumbing", null, null, null);

    assertThat(response.items()).hasSize(2);
    assertThat(response.items().get(0).fullName()).isEqualTo("PlumbingExpert");
    assertThat(response.items().get(1).fullName()).isEqualTo("HVACExpert");
  }

  @Test
  void search_shouldSortByExperienceDescThenName() {
    ExpertProfile p1 = profile("Charlie", "Plumbing", 5, true, Set.of("Plumbing"), "A", null, null);
    ExpertProfile p2 = profile("Alice", "Plumbing", 10, true, Set.of("Plumbing"), "B", null, null);
    ExpertProfile p3 = profile("Bob", "Plumbing", 5, true, Set.of("Plumbing"), "C", null, null);

    when(expertProfileRepository.findAllWithUser()).thenReturn(List.of(p1, p2, p3));

    PaginatedExpertResponse response = expertSearchService.search(1, 20, false, null, null, null, null);

    List<String> names = response.items().stream().map(ExpertListingDto::fullName).toList();
    assertThat(names).containsExactly("Alice", "Bob", "Charlie");
  }
}
