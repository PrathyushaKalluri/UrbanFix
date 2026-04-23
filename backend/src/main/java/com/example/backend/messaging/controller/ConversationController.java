package com.example.backend.messaging.controller;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.dto.ConversationSummaryResponse;
import com.example.backend.messaging.dto.CreateConversationRequest;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.service.ConversationService;
import com.example.backend.messaging.service.MessageAuthorizationService;
import com.example.backend.messaging.service.PresenceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages/conversations")
public class ConversationController {

  private final ConversationService conversationService;
  private final MessageAuthorizationService messageAuthorizationService;
  private final PresenceService presenceService;

  public ConversationController(
      ConversationService conversationService,
      MessageAuthorizationService messageAuthorizationService,
      PresenceService presenceService) {
    this.conversationService = conversationService;
    this.messageAuthorizationService = messageAuthorizationService;
    this.presenceService = presenceService;
  }

  @GetMapping("/{conversationId}")
  public ResponseEntity<Conversation> getConversation(
      Authentication authentication,
      @PathVariable Long conversationId) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    messageAuthorizationService.requireParticipant(conversationId, user.getId());
    presenceService.refreshHeartbeat(user.getId());

    return conversationService.findById(conversationId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/with-expert/{expertUserId}")
  public ResponseEntity<Map<String, Object>> findOrCreateWithExpert(
      Authentication authentication,
      @PathVariable Long expertUserId) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    messageAuthorizationService.requireNotSelfMessaging(user.getId(), expertUserId);

    Conversation conversation = conversationService.findOrCreateConversation(user.getId(), expertUserId);
    return ResponseEntity.ok(Map.of(
        "conversationId", conversation.getId(),
        "conversationKey", conversation.getConversationKey(),
        "createdAt", conversation.getCreatedAt()
    ));
  }

  @GetMapping
  public ResponseEntity<List<ConversationSummaryResponse>> listMyConversations(
      Authentication authentication) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    presenceService.refreshHeartbeat(user.getId());
    List<ConversationSummaryResponse> conversations = conversationService.listConversationsForUser(user.getId());
    return ResponseEntity.ok(conversations);
  }
}
