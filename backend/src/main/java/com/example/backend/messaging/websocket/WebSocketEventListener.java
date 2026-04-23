package com.example.backend.messaging.websocket;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.service.OfflineDeliveryService;
import com.example.backend.messaging.service.PresenceService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

  private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

  private final PresenceService presenceService;
  private final OfflineDeliveryService offlineDeliveryService;
  private final MessagingEventPublisher eventPublisher;

  public WebSocketEventListener(
      PresenceService presenceService,
      OfflineDeliveryService offlineDeliveryService,
      MessagingEventPublisher eventPublisher) {
    this.presenceService = presenceService;
    this.offlineDeliveryService = offlineDeliveryService;
    this.eventPublisher = eventPublisher;
  }

  @EventListener
  public void handleSessionConnect(SessionConnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    UserAccount user = extractUser(accessor);
    if (user != null) {
      Long userId = user.getId();
      log.debug("WebSocket connect for user {}", userId);
      presenceService.markOnline(userId);
      eventPublisher.publishPresence(userId, true);
      // Replay any messages that arrived while user was offline
      if (offlineDeliveryService.hasPendingMessages(userId)) {
        offlineDeliveryService.replayPendingMessages(userId);
      }
    } else {
      log.warn("WebSocket connect event received but could not extract user. sessionId={}",
          accessor.getSessionId());
    }
  }

  @EventListener
  public void handleSessionDisconnect(SessionDisconnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    UserAccount user = extractUser(accessor);
    if (user != null) {
      Long userId = user.getId();
      log.debug("WebSocket disconnect for user {}", userId);
      presenceService.markOffline(userId);
      eventPublisher.publishPresence(userId, false);
    }
  }

  private UserAccount extractUser(StompHeaderAccessor accessor) {
    // Primary: accessor.getUser() — set by our MessagingWebSocketInterceptor on CONNECT
    Object principal = accessor.getUser();
    if (principal instanceof org.springframework.security.core.Authentication auth) {
      Object userPrincipal = auth.getPrincipal();
      if (userPrincipal instanceof UserAccount user) {
        return user;
      }
    }

    // Fallback: session attributes (Spring stores principal name here)
    Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
    if (sessionAttrs != null) {
      Object principalName = sessionAttrs.get("SPRING.SESSION.PRINCIPAL.NAME");
      if (principalName instanceof String email) {
        log.debug("Found principal name in session attributes: {}", email);
      }
    }

    return null;
  }
}
