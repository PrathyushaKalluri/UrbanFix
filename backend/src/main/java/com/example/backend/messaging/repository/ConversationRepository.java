package com.example.backend.messaging.repository;

import com.example.backend.messaging.entity.Conversation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

  Optional<Conversation> findByConversationKey(String conversationKey);
}
