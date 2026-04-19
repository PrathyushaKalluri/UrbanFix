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

  @Column(length = 500)
  private String bio;

  @Column(nullable = false)
  private Boolean available;

  @Column(nullable = false)
  private Boolean servesAsResident;

  @ElementCollection
  @CollectionTable(name = "expert_expertise", joinColumns = @JoinColumn(name = "expert_profile_id"))
  @Column(name = "expertise", nullable = false)
  private Set<String> expertiseAreas = new LinkedHashSet<>();

  @ElementCollection
  @CollectionTable(name = "expert_work_areas", joinColumns = @JoinColumn(name = "expert_profile_id"))
  @Column(name = "work_area", nullable = false)
  private Set<String> workAreas = new LinkedHashSet<>();

  protected ExpertProfile() {
  }

  public ExpertProfile(
      UserAccount user,
      Integer yearsOfExperience,
      String primaryExpertise,
      String bio,
      Boolean available,
      Boolean servesAsResident,
      Set<String> expertiseAreas,
      Set<String> workAreas) {
    this.user = user;
    this.yearsOfExperience = yearsOfExperience;
    this.primaryExpertise = primaryExpertise;
    this.bio = bio;
    this.available = available;
    this.servesAsResident = servesAsResident;
    this.expertiseAreas = new LinkedHashSet<>(expertiseAreas);
    this.workAreas = new LinkedHashSet<>(workAreas);
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

  public String getPrimaryExpertise() {
    return primaryExpertise;
  }

  public String getBio() {
    return bio;
  }

  public Boolean getAvailable() {
    return available;
  }

  public Boolean getServesAsResident() {
    return servesAsResident;
  }

  public Set<String> getExpertiseAreas() {
    return Set.copyOf(expertiseAreas);
  }

  public Set<String> getWorkAreas() {
    return Set.copyOf(workAreas);
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