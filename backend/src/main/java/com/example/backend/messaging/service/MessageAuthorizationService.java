package com.example.backend.messaging.service;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class MessageAuthorizationService {

  private final ConversationService conversationService;
  private final UserRepository userRepository;

  public MessageAuthorizationService(
      ConversationService conversationService,
      UserRepository userRepository) {
    this.conversationService = conversationService;
    this.userRepository = userRepository;
  }

  public void requireParticipant(Long conversationId, Long userId) {
    if (!conversationService.isParticipant(conversationId, userId)) {
      throw new IllegalArgumentException("User is not a participant in this conversation");
    }
  }

  public void requireNotSelfMessaging(Long currentUserId, Long otherUserId) {
    if (currentUserId.equals(otherUserId)) {
      throw new IllegalArgumentException("Cannot message yourself");
    }
  }

  public String resolveSenderName(Long userId) {
    return userRepository.findById(userId)
        .map(UserAccount::getFullName)
        .orElse("Unknown");
  }
}
