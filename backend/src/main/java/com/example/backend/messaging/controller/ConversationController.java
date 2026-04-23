package com.example.backend.messaging.controller;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.dto.ConversationSummaryResponse;
import com.example.backend.messaging.dto.CreateConversationRequest;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.service.ConversationService;
import com.example.backend.messaging.service.MessageAuthorizationService;
import jakarta.validation.Valid;
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

  public ConversationController(
      ConversationService conversationService,
      MessageAuthorizationService messageAuthorizationService) {
    this.conversationService = conversationService;
    this.messageAuthorizationService = messageAuthorizationService;
  }

  @GetMapping("/{conversationId}")
  public ResponseEntity<Conversation> getConversation(
      Authentication authentication,
      @PathVariable Long conversationId) {

    UserAccount user = (UserAccount) authentication.getPrincipal();
    messageAuthorizationService.requireParticipant(conversationId, user.getId());

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
}
