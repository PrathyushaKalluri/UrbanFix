package com.example.backend.messaging.websocket;

import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.dto.SocketDeliveryEvent;
import com.example.backend.messaging.dto.SocketReadEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class MessagingEventPublisher {

  private final SimpMessagingTemplate messagingTemplate;

  public MessagingEventPublisher(SimpMessagingTemplate messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
  }

  public void publishMessage(Long conversationId, MessageResponse message) {
    String destination = "/topic/conversations/" + conversationId;
    messagingTemplate.convertAndSend(destination, message);
  }

  public void publishDelivery(Long conversationId, SocketDeliveryEvent event) {
    String destination = "/topic/conversations/" + conversationId + "/delivery";
    messagingTemplate.convertAndSend(destination, event);
  }

  public void publishRead(Long conversationId, SocketReadEvent event) {
    String destination = "/topic/conversations/" + conversationId + "/read";
    messagingTemplate.convertAndSend(destination, event);
  }

  public void publishPresence(Long userId, boolean online) {
    String destination = "/topic/presence/" + userId;
    messagingTemplate.convertAndSend(destination, new com.example.backend.messaging.dto.SocketPresenceEvent(userId, online));
  }
}
