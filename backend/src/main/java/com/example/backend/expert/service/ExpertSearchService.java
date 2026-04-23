package com.example.backend.expert.service;

import com.example.backend.auth.entity.ExpertProfile;
import com.example.backend.auth.repository.ExpertProfileRepository;
import com.example.backend.expert.dto.ExpertListingDto;
import com.example.backend.expert.dto.PaginatedExpertResponse;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExpertSearchService {

  private final ExpertProfileRepository expertProfileRepository;

  public ExpertSearchService(ExpertProfileRepository expertProfileRepository) {
    this.expertProfileRepository = expertProfileRepository;
  }

  @Transactional(readOnly = true)
  public PaginatedExpertResponse search(
      int page,
      int pageSize,
      boolean availableOnly,
      String search,
      Double latitude,
      Double longitude,
      Double radiusKm) {

    List<ExpertProfile> experts = expertProfileRepository.findAllWithUser();

    if (availableOnly) {
      experts = experts.stream().filter(e -> Boolean.TRUE.equals(e.getAvailable())).toList();
    }

    if (search != null && !search.isBlank()) {
      String normalizedSearch = search.toLowerCase();
      experts = experts.stream()
          .filter(e -> matchesSearch(e, normalizedSearch))
          .toList();
    }

    boolean locationEnabled = latitude != null && longitude != null;
    double effectiveRadius = radiusKm != null ? radiusKm : 15.0;

    if (locationEnabled) {
      experts = experts.stream()
          .filter(e -> withinRadius(e, latitude, longitude, effectiveRadius))
          .toList();
    }

    List<ExpertListingDto> items = experts.stream()
        .sorted(buildComparator(search))
        .map(this::toDto)
        .toList();

    int totalItems = items.size();
    int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / pageSize);
    int start = Math.max(page - 1, 0) * pageSize;
    int end = Math.min(start + pageSize, totalItems);
    List<ExpertListingDto> pageItems = items.subList(start, end);

    return new PaginatedExpertResponse(pageItems, page, pageSize, totalItems, totalPages);
  }

  private boolean matchesSearch(ExpertProfile expert, String normalizedSearch) {
    String text = (expert.getPrimaryExpertise() + " " +
        String.join(" ", expert.getExpertiseAreas()) + " " +
        expert.getUser().getFullName() + " " +
        (expert.getServiceArea() != null ? expert.getServiceArea() : "")).toLowerCase();
    return text.contains(normalizedSearch);
  }

  private Comparator<ExpertProfile> buildComparator(String search) {
    if (search == null || search.isBlank()) {
      return Comparator
          .comparing(ExpertProfile::getYearsOfExperience, Comparator.reverseOrder())
          .thenComparing(e -> e.getUser().getFullName(), String.CASE_INSENSITIVE_ORDER);
    }
    String normalizedSearch = search.toLowerCase();
    return Comparator
        .comparing((ExpertProfile e) -> primaryExpertiseMatches(e, normalizedSearch) ? 0 : 1)
        .thenComparing(ExpertProfile::getYearsOfExperience, Comparator.reverseOrder())
        .thenComparing(e -> e.getUser().getFullName(), String.CASE_INSENSITIVE_ORDER);
  }

  private boolean primaryExpertiseMatches(ExpertProfile expert, String normalizedSearch) {
    String primary = expert.getPrimaryExpertise().toLowerCase();
    return primary.equals(normalizedSearch) || primary.contains(normalizedSearch);
  }

  private boolean withinRadius(ExpertProfile expert, double lat, double lon, double radiusKm) {
    if (expert.getLatitude() == null || expert.getLongitude() == null) {
      return false;
    }
    return haversineKm(lat, lon, expert.getLatitude(), expert.getLongitude()) <= radiusKm;
  }

  private ExpertListingDto toDto(ExpertProfile expert) {
    return new ExpertListingDto(
        expert.getId(),
        expert.getUser().getId(),
        expert.getUser().getFullName(),
        expert.getPrimaryExpertise(),
        expert.getYearsOfExperience(),
        expert.getAvailable(),
        expert.getServiceArea(),
        expert.getLatitude(),
        expert.getLongitude(),
        expert.getExpertiseAreas());
  }

  private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
    final double R = 6371.0;
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
