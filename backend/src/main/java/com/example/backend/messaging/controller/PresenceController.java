package com.example.backend.messaging.controller;

import com.example.backend.messaging.service.PresenceService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages/presence")
public class PresenceController {

  private final PresenceService presenceService;

  public PresenceController(PresenceService presenceService) {
    this.presenceService = presenceService;
  }

  @GetMapping("/{userId}")
  public ResponseEntity<Map<String, Object>> getPresence(@PathVariable Long userId) {
    boolean online = presenceService.isOnline(userId);
    return ResponseEntity.ok(Map.of(
        "userId", userId,
        "online", online
    ));
  }
}
