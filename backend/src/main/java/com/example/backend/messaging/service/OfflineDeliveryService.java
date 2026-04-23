package com.example.backend.messaging.service;

import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.entity.Message;
import com.example.backend.messaging.repository.MessageRepository;
import com.example.backend.messaging.websocket.MessagingEventPublisher;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfflineDeliveryService {

  private static final String PENDING_PREFIX = "pending:";

  private final StringRedisTemplate redisTemplate;
  private final MessageRepository messageRepository;
  private final MessageMapper messageMapper;
  private final MessagingEventPublisher eventPublisher;
  private final PresenceService presenceService;

  public OfflineDeliveryService(
      StringRedisTemplate redisTemplate,
      MessageRepository messageRepository,
      MessageMapper messageMapper,
      MessagingEventPublisher eventPublisher,
      PresenceService presenceService) {
    this.redisTemplate = redisTemplate;
    this.messageRepository = messageRepository;
    this.messageMapper = messageMapper;
    this.eventPublisher = eventPublisher;
    this.presenceService = presenceService;
  }

  public void queueForOfflineUser(Long messageId, Long recipientUserId) {
    String key = PENDING_PREFIX + recipientUserId;
    redisTemplate.opsForList().rightPush(key, String.valueOf(messageId));
  }

  @Transactional(readOnly = true)
  public void replayPendingMessages(Long userId) {
    String key = PENDING_PREFIX + userId;
    List<String> pendingIds = new ArrayList<>();

    String id;
    while ((id = redisTemplate.opsForList().leftPop(key)) != null) {
      pendingIds.add(id);
    }

    for (String messageIdStr : pendingIds) {
      try {
        Long messageId = Long.valueOf(messageIdStr);
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) continue;

        MessageResponse response = messageMapper.toResponse(message, null);
        eventPublisher.publishMessage(message.getConversation().getId(), response);
      } catch (NumberFormatException ignored) {
        // Skip invalid entries
      }
    }
  }

  public boolean hasPendingMessages(Long userId) {
    String key = PENDING_PREFIX + userId;
    Long size = redisTemplate.opsForList().size(key);
    return size != null && size > 0;
  }
}
