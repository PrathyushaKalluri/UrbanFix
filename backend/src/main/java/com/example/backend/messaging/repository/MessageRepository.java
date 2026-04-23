package com.example.backend.messaging.repository;

import com.example.backend.messaging.entity.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

  List<Message> findByConversationIdOrderByCreatedAtAscIdAsc(Long conversationId);
}
