package com.example.backend.matching.service;

import com.example.backend.auth.entity.ExpertProfile;
import com.example.backend.auth.repository.ExpertProfileRepository;
import com.example.backend.matching.dto.MatchingRequest;
import com.example.backend.matching.dto.MatchingResponse;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MatchingService {

  private static final Pattern TOKEN_PATTERN = Pattern.compile("[a-zA-Z0-9-]+");

  private static final Map<String, List<String>> KEYWORD_MAP = Map.of(
      "Plumbing", List.of("plumb", "pipe", "leak", "drain", "faucet", "tap", "sink", "pipeline", "bathroom"),
      "Electrical", List.of("electrical", "wire", "wiring", "switch", "breaker", "mcb", "socket", "inverter", "fan", "circuit", "appliance"),
      "HVAC", List.of("ac", "air condition", "cooling", "hvac", "compressor", "gas refill", "filter", "service", "ventilation"),
      "Carpentry", List.of("carpentry", "wood", "door", "hinge", "furniture", "cabinet", "shelf", "woodwork"),
      "Painting", List.of("paint", "wall", "coating", "finishing", "renovation", "interior", "decor"),
      "Locksmith", List.of("lock", "unlock", "key", "security", "bolt"),
      "Handyman", List.of("repair", "fix", "maintenance", "general")
  );

  private final ExpertProfileRepository expertProfileRepository;

  public MatchingService(ExpertProfileRepository expertProfileRepository) {
    this.expertProfileRepository = expertProfileRepository;
  }

  @Transactional(readOnly = true)
  public MatchingResponse recommend(MatchingRequest request) {
    List<ExpertProfile> candidates = expertProfileRepository.findAllByAvailableTrue();

    boolean locationEnabled = request.latitude() != null && request.longitude() != null;
    double radiusKm = 15.0;

    List<ExpertProfile> filtered = candidates.stream()
        .filter(candidate -> !locationEnabled || withinRadius(candidate, request.latitude(), request.longitude(), radiusKm))
        .toList();

    Set<String> requestTerms = inferTerms(request.problemText());
    List<ExpertProfile> termFiltered = filterByTerms(filtered, requestTerms);

    List<MatchingResponse.Suggestion> scored = termFiltered.stream()
        .map(candidate -> scoreCandidate(candidate, requestTerms, request.latitude(), request.longitude(), radiusKm))
        .filter(s -> s.score() > 0.0)
        .sorted(Comparator.comparing(MatchingResponse.Suggestion::score).reversed())
        .toList();

    List<MatchingResponse.Suggestion> result = scored;
    if (request.topN() != null && request.topN() > 0) {
      result = scored.stream().limit(request.topN()).toList();
    }

    return new MatchingResponse(request.problemText(), result);
  }

  private boolean withinRadius(ExpertProfile candidate, Double lat, Double lon, double radiusKm) {
    if (candidate.getLatitude() == null || candidate.getLongitude() == null) {
      return false;
    }
    return haversineKm(lat, lon, candidate.getLatitude(), candidate.getLongitude()) <= radiusKm;
  }

  private Set<String> inferTerms(String problemText) {
    String normalized = problemText.toLowerCase();
    Set<String> inferred = new LinkedHashSet<>();

    for (Map.Entry<String, List<String>> entry : KEYWORD_MAP.entrySet()) {
      for (String keyword : entry.getValue()) {
        if (normalized.contains(keyword)) {
          inferred.add(entry.getKey());
          break;
        }
      }
    }

    var matcher = TOKEN_PATTERN.matcher(normalized);
    while (matcher.find()) {
      String token = matcher.group();
      if (token.length() > 4) {
        inferred.add(capitalize(token));
      }
    }

    return inferred;
  }

  private static String capitalize(String word) {
    if (word == null || word.isEmpty()) {
      return word;
    }
    return Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase();
  }

  private List<ExpertProfile> filterByTerms(List<ExpertProfile> candidates, Set<String> requestTerms) {
    if (requestTerms == null || requestTerms.isEmpty()) {
      return candidates;
    }

    Set<String> normalizedTerms = requestTerms.stream()
        .map(String::toLowerCase)
        .collect(Collectors.toSet());

    List<ExpertProfile> filtered = new java.util.ArrayList<>();
    for (ExpertProfile candidate : candidates) {
      Set<String> candidateTerms = new LinkedHashSet<>();
      candidateTerms.add(candidate.getPrimaryExpertise().toLowerCase());
      if (candidate.getExpertiseAreas() != null) {
        for (String skill : candidate.getExpertiseAreas()) {
          candidateTerms.add(skill.toLowerCase());
        }
      }

      String searchable = String.join(" ", candidateTerms);
      for (String term : normalizedTerms) {
        if (searchable.contains(term)) {
          filtered.add(candidate);
          break;
        }
      }
    }

    return filtered.isEmpty() ? candidates : filtered;
  }

  private MatchingResponse.Suggestion scoreCandidate(
      ExpertProfile candidate,
      Set<String> requestTerms,
      Double latitude,
      Double longitude,
      double radiusKm) {

    Set<String> expertiseTokens = new LinkedHashSet<>();
    expertiseTokens.add(candidate.getPrimaryExpertise().toLowerCase());
    if (candidate.getExpertiseAreas() != null) {
      for (String skill : candidate.getExpertiseAreas()) {
        expertiseTokens.add(skill.toLowerCase());
      }
    }

    Set<String> termTokens = requestTerms.stream()
        .map(String::toLowerCase)
        .collect(Collectors.toSet());

    double primaryScore = 0.0;
    double secondaryScore = 0.0;
    String primaryLower = candidate.getPrimaryExpertise().toLowerCase();

    for (String term : termTokens) {
      boolean primaryMatches = primaryLower.contains(term) || term.contains(primaryLower);
      if (primaryMatches) {
        primaryScore += 1.0;
      } else {
        for (String expertise : expertiseTokens) {
          if (expertise.contains(term) || term.contains(expertise)) {
            secondaryScore += 1.0;
            break;
          }
        }
      }
    }

    int requestScale = Math.max(termTokens.size(), 1);
    primaryScore = Math.min(primaryScore / requestScale, 1.0);
    secondaryScore = Math.min(secondaryScore / requestScale, 1.0);
    double skillScore = 0.6 * primaryScore + 0.4 * secondaryScore;

    double experienceScore = Math.min(candidate.getYearsOfExperience() / 5.0, 1.0);
    double availabilityScore = Boolean.TRUE.equals(candidate.getAvailable()) ? 1.0 : 0.0;

    double locationScore = 0.0;
    if (latitude != null && longitude != null && candidate.getLatitude() != null && candidate.getLongitude() != null) {
      double distance = haversineKm(latitude, longitude, candidate.getLatitude(), candidate.getLongitude());
      locationScore = Math.max(0.0, 1.0 - (distance / Math.max(radiusKm, 1.0)));
    }

    double total = 0.45 * skillScore + 0.25 * experienceScore + 0.15 * availabilityScore + 0.15 * locationScore;

    List<String> reasons = new java.util.ArrayList<>();
    if (primaryScore > 0.0) {
      reasons.add("Primary expertise matches query");
    } else if (secondaryScore > 0.0) {
      reasons.add("Secondary skills match query");
    }
    reasons.add(candidate.getYearsOfExperience() + " years experience");
    reasons.add(Boolean.TRUE.equals(candidate.getAvailable()) ? "Currently available" : "Temporarily unavailable");
    if (locationScore > 0.0) {
      reasons.add("Nearby service area");
    }

    Map<String, Double> breakdown = new LinkedHashMap<>();
    breakdown.put("skill", round(skillScore));
    breakdown.put("experience", round(experienceScore));
    breakdown.put("availability", round(availabilityScore));
    breakdown.put("location", round(locationScore));

    return new MatchingResponse.Suggestion(
        candidate.getId(),
        candidate.getUser().getId(),
        candidate.getUser().getFullName(),
        candidate.getPrimaryExpertise(),
        candidate.getYearsOfExperience(),
        candidate.getAvailable(),
        candidate.getServiceArea(),
        candidate.getLatitude(),
        candidate.getLongitude(),
        candidate.getExpertiseAreas(),
        round(total),
        breakdown,
        reasons);
  }

  private static double round(double value) {
    return Math.round(value * 10000.0) / 10000.0;
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
