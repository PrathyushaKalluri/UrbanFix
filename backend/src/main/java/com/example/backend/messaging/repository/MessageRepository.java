package com.example.backend.messaging.repository;

import com.example.backend.messaging.entity.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

  List<Message> findByConversationIdOrderByCreatedAtAscIdAsc(Long conversationId);

  Optional<Message> findTopByConversationIdOrderByCreatedAtDesc(Long conversationId);

  @Query("""
      SELECT COUNT(m) FROM Message m
      WHERE m.conversation.id = :conversationId
      AND m.senderUserId != :userId
      AND NOT EXISTS (
          SELECT r FROM MessageReadReceipt r
          WHERE r.message.id = m.id
          AND r.recipientUserId = :userId
          AND r.readAt IS NOT NULL
      )
      """)
  long countUnreadByConversationAndUser(
      @Param("conversationId") Long conversationId,
      @Param("userId") Long userId);
}
