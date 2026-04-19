package com.example.backend.web;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingController {

  @GetMapping("/api/hello")
  public Map<String, String> hello() {
    return Map.of("message", "Hello from Spring Boot");
  }
}
