package com.example.backend.auth.service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class HyderabadAreaCoordinateResolver implements AreaCoordinateResolver {

  private static final Map<String, ResolvedAreaCoordinate> AREA_COORDINATES = buildAreaCoordinates();
  private static final String DEFAULT_AREA = "Madhapur";

  @Override
  public ResolvedAreaCoordinate resolve(String areaName) {
    if (areaName == null || areaName.isBlank()) {
      return defaultArea();
    }

    String normalizedName = areaName.trim();
    return AREA_COORDINATES.getOrDefault(normalizedName, defaultArea());
  }

  @Override
  public ResolvedAreaCoordinate defaultArea() {
    return AREA_COORDINATES.get(DEFAULT_AREA);
  }

  private static Map<String, ResolvedAreaCoordinate> buildAreaCoordinates() {
    Map<String, ResolvedAreaCoordinate> areas = new LinkedHashMap<>();
    areas.put("Madhapur", new ResolvedAreaCoordinate("Madhapur", 17.4483, 78.3915));
    areas.put("Gachibowli", new ResolvedAreaCoordinate("Gachibowli", 17.4401, 78.3489));
    areas.put("Hitech City", new ResolvedAreaCoordinate("Hitech City", 17.4435, 78.3772));
    areas.put("Kukatpally", new ResolvedAreaCoordinate("Kukatpally", 17.4933, 78.4011));
    areas.put("Ameerpet", new ResolvedAreaCoordinate("Ameerpet", 17.4374, 78.4482));
    areas.put("Banjara Hills", new ResolvedAreaCoordinate("Banjara Hills", 17.4138, 78.4398));
    areas.put("Jubilee Hills", new ResolvedAreaCoordinate("Jubilee Hills", 17.4326, 78.4071));
    areas.put("Begumpet", new ResolvedAreaCoordinate("Begumpet", 17.4440, 78.4627));
    areas.put("Secunderabad", new ResolvedAreaCoordinate("Secunderabad", 17.4399, 78.4983));
    areas.put("LB Nagar", new ResolvedAreaCoordinate("LB Nagar", 17.3457, 78.5522));
    areas.put("Uppal", new ResolvedAreaCoordinate("Uppal", 17.4062, 78.5591));
    areas.put("Mehdipatnam", new ResolvedAreaCoordinate("Mehdipatnam", 17.3959, 78.4331));
    return Map.copyOf(areas);
  }
}
