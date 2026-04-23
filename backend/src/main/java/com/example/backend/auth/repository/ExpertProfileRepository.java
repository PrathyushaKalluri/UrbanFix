package com.example.backend.auth.repository;

import com.example.backend.auth.entity.ExpertProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ExpertProfileRepository extends JpaRepository<ExpertProfile, Long> {

  Optional<ExpertProfile> findByUserId(Long userId);

  @EntityGraph(attributePaths = "user")
  List<ExpertProfile> findAllByAvailableTrue();

  @EntityGraph(attributePaths = "user")
  @Query("SELECT e FROM ExpertProfile e")
  List<ExpertProfile> findAllWithUser();
}