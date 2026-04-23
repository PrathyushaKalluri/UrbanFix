package com.example.backend.messaging.service;

import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.entity.Message;
import com.example.backend.messaging.entity.MessageDeliveryState;
import com.example.backend.messaging.entity.MessageReadReceipt;
import com.example.backend.messaging.repository.ConversationParticipantRepository;
import com.example.backend.messaging.repository.MessageReadReceiptRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

  private final MessageReadReceiptRepository readReceiptRepository;
  private final ConversationParticipantRepository participantRepository;

  public MessageMapper(
      MessageReadReceiptRepository readReceiptRepository,
      ConversationParticipantRepository participantRepository) {
    this.readReceiptRepository = readReceiptRepository;
    this.participantRepository = participantRepository;
  }

  public MessageResponse toResponse(Message message, String senderName) {
    Long recipientUserId = resolveRecipientUserId(message);

    Optional<MessageReadReceipt> receiptOpt = recipientUserId != null
        ? readReceiptRepository.findByMessageIdAndRecipientUserId(message.getId(), recipientUserId)
        : Optional.empty();

    Instant deliveredAt = receiptOpt.map(MessageReadReceipt::getDeliveredAt).orElse(null);
    Instant readAt = receiptOpt.map(MessageReadReceipt::getReadAt).orElse(null);

    return new MessageResponse(
        message.getId(),
        message.getConversation().getId(),
        message.getSenderUserId(),
        senderName,
        message.getBody(),
        message.getMessageType(),
        resolveDeliveryState(deliveredAt, readAt),
        message.getClientMessageId(),
        message.getCreatedAt(),
        deliveredAt,
        readAt
    );
  }

  private Long resolveRecipientUserId(Message message) {
    List<com.example.backend.messaging.entity.ConversationParticipant> participants =
        participantRepository.findByConversationId(message.getConversation().getId());

    return participants.stream()
        .filter(p -> !p.getUserId().equals(message.getSenderUserId()))
        .map(com.example.backend.messaging.entity.ConversationParticipant::getUserId)
        .findFirst()
        .orElse(null);
  }

  private MessageDeliveryState resolveDeliveryState(Instant deliveredAt, Instant readAt) {
    if (readAt != null) {
      return MessageDeliveryState.READ;
    }
    if (deliveredAt != null) {
      return MessageDeliveryState.DELIVERED;
    }
    return MessageDeliveryState.SENT;
  }
}
