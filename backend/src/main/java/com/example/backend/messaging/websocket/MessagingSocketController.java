package com.example.backend.messaging.websocket;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.dto.SendMessageRequest;
import com.example.backend.messaging.dto.SocketMessagePayload;
import com.example.backend.messaging.service.MessageAuthorizationService;
import com.example.backend.messaging.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class MessagingSocketController {

  private final MessageService messageService;
  private final MessageAuthorizationService messageAuthorizationService;

  public MessagingSocketController(
      MessageService messageService,
      MessageAuthorizationService messageAuthorizationService) {
    this.messageService = messageService;
    this.messageAuthorizationService = messageAuthorizationService;
  }

  @MessageMapping("/messages.send")
  public void sendMessage(
      @Payload SocketMessagePayload payload,
      SimpMessageHeaderAccessor headerAccessor) {

    UserAccount user = (UserAccount) headerAccessor.getUser();
    if (user == null) {
      throw new IllegalStateException("Unauthenticated");
    }

    messageAuthorizationService.requireParticipant(payload.conversationId(), user.getId());

    SendMessageRequest request = new SendMessageRequest(
        payload.conversationId(),
        payload.body(),
        payload.clientMessageId()
    );

    messageService.sendMessage(user, request);
  }
}
