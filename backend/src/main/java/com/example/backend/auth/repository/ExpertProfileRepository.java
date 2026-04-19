package com.example.backend.auth.repository;

import com.example.backend.auth.entity.ExpertProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpertProfileRepository extends JpaRepository<ExpertProfile, Long> {

  Optional<ExpertProfile> findByUserId(Long userId);
}