package com.example.backend.messaging.service;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.repository.UserRepository;
import com.example.backend.messaging.dto.ConversationSummaryResponse;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.entity.ConversationParticipant;
import com.example.backend.messaging.entity.Message;
import com.example.backend.messaging.repository.ConversationParticipantRepository;
import com.example.backend.messaging.repository.ConversationRepository;
import com.example.backend.messaging.repository.MessageRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationService {

  private final ConversationRepository conversationRepository;
  private final ConversationParticipantRepository participantRepository;
  private final MessageRepository messageRepository;
  private final UserRepository userRepository;

  public ConversationService(
      ConversationRepository conversationRepository,
      ConversationParticipantRepository participantRepository,
      MessageRepository messageRepository,
      UserRepository userRepository) {
    this.conversationRepository = conversationRepository;
    this.participantRepository = participantRepository;
    this.messageRepository = messageRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public Optional<Conversation> findByParticipantPair(Long userId1, Long userId2) {
    String key = buildConversationKey(userId1, userId2);
    return conversationRepository.findByConversationKey(key);
  }

  @Transactional
  public Conversation findOrCreateConversation(Long currentUserId, Long otherUserId) {
    if (currentUserId.equals(otherUserId)) {
      throw new IllegalArgumentException("Cannot create a conversation with yourself");
    }

    String key = buildConversationKey(currentUserId, otherUserId);

    return conversationRepository.findByConversationKey(key)
        .orElseGet(() -> createConversation(currentUserId, otherUserId, key));
  }

  @Transactional(readOnly = true)
  public Optional<Conversation> findById(Long conversationId) {
    return conversationRepository.findById(conversationId);
  }

  @Transactional(readOnly = true)
  public List<ConversationParticipant> getParticipants(Long conversationId) {
    return participantRepository.findByConversationId(conversationId);
  }

  @Transactional(readOnly = true)
  public boolean isParticipant(Long conversationId, Long userId) {
    return participantRepository.findByConversationIdAndUserId(conversationId, userId)
        .filter(ConversationParticipant::getIsActive)
        .isPresent();
  }

  @Transactional(readOnly = true)
  public Optional<Long> getOtherParticipantUserId(Long conversationId, Long currentUserId) {
    return getParticipants(conversationId).stream()
        .filter(p -> !p.getUserId().equals(currentUserId))
        .map(ConversationParticipant::getUserId)
        .findFirst();
  }

  @Transactional(readOnly = true)
  public List<ConversationSummaryResponse> listConversationsForUser(Long userId) {
    List<ConversationParticipant> participants = participantRepository.findByUserId(userId);

    return participants.stream()
        .filter(ConversationParticipant::getIsActive)
        .map(ConversationParticipant::getConversation)
        .distinct()
        .sorted(Comparator.comparing(Conversation::getUpdatedAt).reversed())
        .map(conversation -> toSummary(conversation, userId))
        .toList();
  }

  private ConversationSummaryResponse toSummary(Conversation conversation, Long currentUserId) {
    Long otherUserId = getOtherParticipantUserId(conversation.getId(), currentUserId)
        .orElse(null);

    String otherParticipantName = userRepository.findById(otherUserId)
        .map(UserAccount::getFullName)
        .orElse("Unknown");

    Optional<Message> lastMessage = messageRepository
        .findTopByConversationIdOrderByCreatedAtDesc(conversation.getId());

    long unreadCount = otherUserId != null
        ? messageRepository.countUnreadByConversationAndUser(conversation.getId(), currentUserId)
        : 0L;

    return new ConversationSummaryResponse(
        conversation.getId(),
        conversation.getConversationKey(),
        conversation.getCreatedByUserId(),
        conversation.getCreatedAt(),
        conversation.getUpdatedAt(),
        lastMessage.map(Message::getCreatedAt).orElse(null),
        otherUserId,
        otherParticipantName,
        lastMessage.map(Message::getBody).orElse(null),
        (int) unreadCount
    );
  }

  private Conversation createConversation(Long userId1, Long userId2, String key) {
    Conversation conversation = new Conversation(key, userId1);
    Conversation saved = conversationRepository.save(conversation);

    participantRepository.save(new ConversationParticipant(saved, userId1));
    participantRepository.save(new ConversationParticipant(saved, userId2));

    return saved;
  }

  static String buildConversationKey(Long userId1, Long userId2) {
    List<Long> sorted = List.of(userId1, userId2).stream()
        .sorted(Comparator.naturalOrder())
        .toList();
    return sorted.get(0) + "_" + sorted.get(1);
  }
}
