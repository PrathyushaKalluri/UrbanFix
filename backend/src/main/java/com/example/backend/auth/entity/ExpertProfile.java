package com.example.backend.auth.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "expert_profiles")
public class ExpertProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private UserAccount user;

  @Column(nullable = false)
  private Integer yearsOfExperience;

  @Column(nullable = false)
  private String primaryExpertise;

  @Column(nullable = false)
  private Boolean available;

  @Column(length = 80)
  private String serviceArea;

  @Column
  private Double latitude;

  @Column
  private Double longitude;

  @ElementCollection
  @CollectionTable(name = "expert_expertise", joinColumns = @JoinColumn(name = "expert_profile_id"))
  @Column(name = "expertise", nullable = false)
  private Set<String> expertiseAreas = new LinkedHashSet<>();

  protected ExpertProfile() {
  }

  public ExpertProfile(
      UserAccount user,
      Integer yearsOfExperience,
      String primaryExpertise,
      Boolean available,
      Set<String> expertiseAreas,
      String serviceArea,
      Double latitude,
      Double longitude) {
    this.user = user;
    this.yearsOfExperience = yearsOfExperience;
    this.primaryExpertise = primaryExpertise;
    this.available = available;
    this.expertiseAreas = new LinkedHashSet<>(expertiseAreas);
    this.serviceArea = serviceArea;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public Integer getYearsOfExperience() {
    return yearsOfExperience;
  }

  public void setYearsOfExperience(Integer yearsOfExperience) {
    this.yearsOfExperience = yearsOfExperience;
  }

  public String getPrimaryExpertise() {
    return primaryExpertise;
  }

  public void setPrimaryExpertise(String primaryExpertise) {
    this.primaryExpertise = primaryExpertise;
  }

  public Boolean getAvailable() {
    return available;
  }

  public void setAvailable(Boolean available) {
    this.available = available;
  }

  public Set<String> getExpertiseAreas() {
    return Set.copyOf(expertiseAreas);
  }

  public String getServiceArea() {
    return serviceArea;
  }

  public void setServiceArea(String serviceArea) {
    this.serviceArea = serviceArea;
  }

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }

  public void setExpertiseAreas(Set<String> expertiseAreas) {
    this.expertiseAreas = new LinkedHashSet<>(expertiseAreas);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    }
    if (other == null || getClass() != other.getClass()) {
      return false;
    }
    ExpertProfile that = (ExpertProfile) other;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}