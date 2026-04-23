package com.example.backend.messaging.repository;

import com.example.backend.messaging.entity.ConversationParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

  List<ConversationParticipant> findByConversationId(Long conversationId);

  Optional<ConversationParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);

  List<ConversationParticipant> findByUserId(Long userId);
}
