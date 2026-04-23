package com.example.backend.messaging.controller;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.dto.MarkReadRequest;
import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.dto.SendMessageRequest;
import com.example.backend.messaging.service.MessageAuthorizationService;
import com.example.backend.messaging.service.MessageService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages/conversations/{conversationId}")
public class MessageController {

  private final MessageService messageService;
  private final MessageAuthorizationService messageAuthorizationService;

  public MessageController(
      MessageService messageService,
      MessageAuthorizationService messageAuthorizationService) {
    this.messageService = messageService;
    this.messageAuthorizationService = messageAuthorizationService;
  }

  @GetMapping("/messages")
  public ResponseEntity<List<MessageResponse>> getHistory(
      Authentication authentication,
      @PathVariable Long conversationId) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    messageAuthorizationService.requireParticipant(conversationId, user.getId());

    List<MessageResponse> history = messageService.getHistory(conversationId);
    return ResponseEntity.ok(history);
  }

  @PostMapping("/messages")
  public ResponseEntity<MessageResponse> sendMessage(
      Authentication authentication,
      @PathVariable Long conversationId,
      @Valid @RequestBody SendMessageRequest request) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    messageAuthorizationService.requireParticipant(conversationId, user.getId());

    // Ensure the request conversationId matches the path variable
    if (!conversationId.equals(request.conversationId())) {
      return ResponseEntity.badRequest().build();
    }

    MessageResponse response = messageService.sendMessage(user, request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/read")
  public ResponseEntity<Map<String, String>> markRead(
      Authentication authentication,
      @PathVariable Long conversationId,
      @Valid @RequestBody MarkReadRequest request) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    messageAuthorizationService.requireParticipant(conversationId, user.getId());

    if (!conversationId.equals(request.conversationId())) {
      return ResponseEntity.badRequest().build();
    }

    messageService.markConversationRead(conversationId, user.getId(), request.lastReadMessageId());
    return ResponseEntity.ok(Map.of("status", "read"));
  }
}
