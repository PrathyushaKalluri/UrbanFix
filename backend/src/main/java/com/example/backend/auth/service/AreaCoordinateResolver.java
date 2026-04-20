package com.example.backend.auth.service;

public interface AreaCoordinateResolver {

  ResolvedAreaCoordinate resolve(String areaName);

  ResolvedAreaCoordinate defaultArea();
}
