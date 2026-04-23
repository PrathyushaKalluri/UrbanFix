package com.example.backend.messaging.service;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.dto.SendMessageRequest;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.entity.Message;
import com.example.backend.messaging.entity.MessageReadReceipt;
import com.example.backend.messaging.repository.ConversationParticipantRepository;
import com.example.backend.messaging.repository.ConversationRepository;
import com.example.backend.messaging.repository.MessageReadReceiptRepository;
import com.example.backend.messaging.repository.MessageRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

  private final MessageRepository messageRepository;
  private final MessageReadReceiptRepository readReceiptRepository;
  private final ConversationParticipantRepository participantRepository;
  private final ConversationRepository conversationRepository;
  private final MessageMapper messageMapper;
  private final com.example.backend.messaging.websocket.MessagingEventPublisher eventPublisher;
  private final PresenceService presenceService;
  private final OfflineDeliveryService offlineDeliveryService;

  public MessageService(
      MessageRepository messageRepository,
      MessageReadReceiptRepository readReceiptRepository,
      ConversationParticipantRepository participantRepository,
      ConversationRepository conversationRepository,
      MessageMapper messageMapper,
      com.example.backend.messaging.websocket.MessagingEventPublisher eventPublisher,
      PresenceService presenceService,
      OfflineDeliveryService offlineDeliveryService) {
    this.messageRepository = messageRepository;
    this.readReceiptRepository = readReceiptRepository;
    this.participantRepository = participantRepository;
    this.conversationRepository = conversationRepository;
    this.messageMapper = messageMapper;
    this.eventPublisher = eventPublisher;
    this.presenceService = presenceService;
    this.offlineDeliveryService = offlineDeliveryService;
  }

  @Transactional
  public MessageResponse sendMessage(UserAccount sender, SendMessageRequest request) {
    Conversation conversation = conversationRepository.findById(request.conversationId())
        .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

    Message message = new Message(conversation, sender.getId(), request.body().trim(), request.clientMessageId());
    Message saved = messageRepository.save(message);

    // Initialize read receipts for all other participants
    List<Long> otherParticipantIds = participantRepository.findByConversationId(request.conversationId()).stream()
        .filter(p -> !p.getUserId().equals(sender.getId()))
        .map(com.example.backend.messaging.entity.ConversationParticipant::getUserId)
        .toList();

    for (Long recipientId : otherParticipantIds) {
      MessageReadReceipt receipt = new MessageReadReceipt(saved, recipientId);
      readReceiptRepository.save(receipt);
    }

    // Update conversation lastMessageAt
    conversation.setLastMessageAt(saved.getCreatedAt());
    conversation.setUpdatedAt(saved.getCreatedAt());
    conversationRepository.save(conversation);

    MessageResponse response = messageMapper.toResponse(saved, sender.getFullName());
    eventPublisher.publishMessage(request.conversationId(), response);

    // Queue for offline recipients
    for (Long recipientId : otherParticipantIds) {
      if (!presenceService.isOnline(recipientId)) {
        offlineDeliveryService.queueForOfflineUser(saved.getId(), recipientId);
      }
    }

    return response;
  }

  @Transactional
  public List<MessageResponse> getHistory(Long conversationId, Long currentUserId) {
    List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAscIdAsc(conversationId);

    // Auto-mark messages from others as delivered for the current user
    for (Message message : messages) {
      if (!message.getSenderUserId().equals(currentUserId)) {
        markDelivered(message.getId(), currentUserId);
      }
    }

    return messages.stream()
        .map(m -> messageMapper.toResponse(m, null))
        .toList();
  }

  @Transactional
  public void markDelivered(Long messageId, Long recipientUserId) {
    readReceiptRepository.findByMessageIdAndRecipientUserId(messageId, recipientUserId)
        .ifPresent(receipt -> {
          if (receipt.getDeliveredAt() == null) {
            receipt.setDeliveredAt(Instant.now());
            readReceiptRepository.save(receipt);
            Long conversationId = receipt.getMessage().getConversation().getId();
            eventPublisher.publishDelivery(
                conversationId,
                new com.example.backend.messaging.dto.SocketDeliveryEvent(
                    messageId, recipientUserId, conversationId));
          }
        });
  }

  @Transactional
  public void markRead(Long messageId, Long recipientUserId) {
    readReceiptRepository.findByMessageIdAndRecipientUserId(messageId, recipientUserId)
        .ifPresent(receipt -> {
          Instant now = Instant.now();
          boolean wasUpdated = false;
          if (receipt.getDeliveredAt() == null) {
            receipt.setDeliveredAt(now);
            wasUpdated = true;
          }
          if (receipt.getReadAt() == null) {
            receipt.setReadAt(now);
            wasUpdated = true;
          }
          if (wasUpdated) {
            readReceiptRepository.save(receipt);
            Long conversationId = receipt.getMessage().getConversation().getId();
            eventPublisher.publishRead(
                conversationId,
                new com.example.backend.messaging.dto.SocketReadEvent(
                    messageId, recipientUserId, conversationId));
          }
        });
  }

  @Transactional
  public void markConversationRead(Long conversationId, Long userId, Long lastReadMessageId) {
    List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAscIdAsc(conversationId);
    messages.stream()
        .filter(m -> m.getId() <= lastReadMessageId && !m.getSenderUserId().equals(userId))
        .forEach(m -> markRead(m.getId(), userId));

    participantRepository.findByConversationIdAndUserId(conversationId, userId)
        .ifPresent(p -> {
          p.setLastReadAt(Instant.now());
          participantRepository.save(p);
        });
  }

  @Transactional(readOnly = true)
  public Optional<Message> findById(Long messageId) {
    return messageRepository.findById(messageId);
  }
}
