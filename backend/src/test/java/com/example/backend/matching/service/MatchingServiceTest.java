package com.example.backend.matching.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.example.backend.auth.entity.ExpertProfile;
import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.repository.ExpertProfileRepository;
import com.example.backend.matching.dto.MatchingRequest;
import com.example.backend.matching.dto.MatchingResponse;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

  @Mock
  private ExpertProfileRepository expertProfileRepository;

  @InjectMocks
  private MatchingService matchingService;

  private ExpertProfile profile(String name, String primary, int years, boolean available,
      Set<String> areas, String serviceArea, Double lat, Double lon) {
    UserAccount user = new UserAccount(name, name.toLowerCase() + "@test.com", "pass", UserRole.EXPERT);
    return new ExpertProfile(user, years, primary, available, areas, serviceArea, lat, lon);
  }

  @Test
  void recommend_shouldReturnSuggestionsOrderedByScore() {
    ExpertProfile plumber1 = profile("Alice", "Plumbing", 5, true,
        Set.of("Plumbing", "Drainage"), "Downtown", 17.3850, 78.4867);
    ExpertProfile plumber2 = profile("Bob", "Plumbing", 3, true,
        Set.of("Plumbing", "Pipes"), "Uptown", 17.4000, 78.5000);

    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of(plumber1, plumber2));

    MatchingRequest request = new MatchingRequest("My kitchen sink is leaking badly", null, null, null);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).hasSize(2);
    assertThat(response.suggestions().get(0).primaryExpertise()).isEqualTo("Plumbing");
    assertThat(response.suggestions().get(0).score()).isGreaterThan(response.suggestions().get(1).score());
  }

  @Test
  void recommend_shouldFilterByLocation() {
    ExpertProfile nearby = profile("Alice", "Plumbing", 5, true,
        Set.of("Plumbing"), "Downtown", 17.3850, 78.4867);
    ExpertProfile far = profile("Bob", "Plumbing", 10, true,
        Set.of("Plumbing"), "Faraway", 18.0, 79.0);

    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of(nearby, far));

    MatchingRequest request = new MatchingRequest("Pipe burst in bathroom", null, 17.3850, 78.4867);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).hasSize(1);
    assertThat(response.suggestions().get(0).fullName()).isEqualTo("Alice");
  }

  @Test
  void recommend_shouldLimitResults_whenTopNProvided() {
    ExpertProfile p1 = profile("A", "Plumbing", 2, true, Set.of("Plumbing"), "A", null, null);
    ExpertProfile p2 = profile("B", "Plumbing", 8, true, Set.of("Plumbing"), "B", null, null);
    ExpertProfile p3 = profile("C", "Plumbing", 5, true, Set.of("Plumbing"), "C", null, null);

    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of(p1, p2, p3));

    MatchingRequest request = new MatchingRequest("Fix my pipes", 2, null, null);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).hasSize(2);
    assertThat(response.suggestions().get(0).fullName()).isEqualTo("B");
    assertThat(response.suggestions().get(1).fullName()).isEqualTo("C");
  }

  @Test
  void recommend_shouldReturnEmpty_whenNoAvailableExperts() {
    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of());

    MatchingRequest request = new MatchingRequest("Sink leaking", null, null, null);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).isEmpty();
  }

  @Test
  void recommend_shouldReturnLowerScore_whenNoSkillOverlap() {
    ExpertProfile electrician = profile("Bob", "Electrical", 3, true,
        Set.of("Electrical"), "Uptown", null, null);

    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of(electrician));

    MatchingRequest request = new MatchingRequest("Very specific underwater basket weaving repair", null, null, null);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).hasSize(1);
    assertThat(response.suggestions().get(0).score()).isLessThan(0.5);
    assertThat(response.suggestions().get(0).breakdown().get("skill")).isEqualTo(0.0);
  }

  @Test
  void recommend_shouldPreferPrimaryExpertiseOverSecondary() {
    ExpertProfile hvacWithPlumbingSecondary = profile("HVACExpert", "HVAC", 8, true,
        Set.of("Plumbing", "Installation", "Repair"), "Madhapur", 17.4500, 78.3900);
    ExpertProfile plumbingPrimary = profile("PlumbingExpert", "Plumbing", 11, true,
        Set.of("Plumbing", "Leak Fix", "Repair"), "Madhapur", 17.4500, 78.3900);

    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of(hvacWithPlumbingSecondary, plumbingPrimary));

    MatchingRequest request = new MatchingRequest("plumbing in Madhapur", null, null, null);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).hasSize(2);
    assertThat(response.suggestions().get(0).fullName()).isEqualTo("PlumbingExpert");
    assertThat(response.suggestions().get(0).primaryExpertise()).isEqualTo("Plumbing");
    assertThat(response.suggestions().get(1).fullName()).isEqualTo("HVACExpert");
    assertThat(response.suggestions().get(0).score()).isGreaterThan(response.suggestions().get(1).score());
  }

  @Test
  void recommend_shouldIncludeBreakdownAndReasons() {
    ExpertProfile plumber = profile("Alice", "Plumbing", 5, true,
        Set.of("Plumbing"), "Downtown", 17.3850, 78.4867);

    when(expertProfileRepository.findAllByAvailableTrue()).thenReturn(List.of(plumber));

    MatchingRequest request = new MatchingRequest("Sink leaking", null, 17.3850, 78.4867);
    MatchingResponse response = matchingService.recommend(request);

    assertThat(response.suggestions()).hasSize(1);
    MatchingResponse.Suggestion s = response.suggestions().get(0);
    assertThat(s.breakdown()).containsKeys("skill", "experience", "availability", "location");
    assertThat(s.reasons()).isNotEmpty();
  }
}
