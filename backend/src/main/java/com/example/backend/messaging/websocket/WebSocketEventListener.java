package com.example.backend.messaging.websocket;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.service.OfflineDeliveryService;
import com.example.backend.messaging.service.PresenceService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

  private final PresenceService presenceService;
  private final OfflineDeliveryService offlineDeliveryService;

  public WebSocketEventListener(
      PresenceService presenceService,
      OfflineDeliveryService offlineDeliveryService) {
    this.presenceService = presenceService;
    this.offlineDeliveryService = offlineDeliveryService;
  }

  @EventListener
  public void handleSessionConnected(SessionConnectedEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    UserAccount user = extractUser(accessor);
    if (user != null) {
      Long userId = user.getId();
      presenceService.markOnline(userId);
      // Replay any messages that arrived while user was offline
      if (offlineDeliveryService.hasPendingMessages(userId)) {
        offlineDeliveryService.replayPendingMessages(userId);
      }
    }
  }

  @EventListener
  public void handleSessionDisconnect(SessionDisconnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    UserAccount user = extractUser(accessor);
    if (user != null) {
      presenceService.markOffline(user.getId());
    }
  }

  private UserAccount extractUser(StompHeaderAccessor accessor) {
    Object principal = accessor.getUser();
    if (principal instanceof org.springframework.security.core.Authentication auth) {
      Object userPrincipal = auth.getPrincipal();
      if (userPrincipal instanceof UserAccount user) {
        return user;
      }
    }
    return null;
  }
}
