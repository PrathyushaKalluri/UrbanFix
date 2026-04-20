package com.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ExpertProfileSchemaCleanup implements CommandLineRunner {

  private final JdbcTemplate jdbcTemplate;

  public ExpertProfileSchemaCleanup(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public void run(String... args) {
    jdbcTemplate.execute("ALTER TABLE expert_profiles DROP COLUMN IF EXISTS bio");
    jdbcTemplate.execute("ALTER TABLE expert_profiles DROP COLUMN IF EXISTS serves_as_resident");
  }
}
