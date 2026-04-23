package com.example.backend.messaging.repository;

import com.example.backend.messaging.entity.MessageReadReceipt;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReadReceiptRepository extends JpaRepository<MessageReadReceipt, Long> {

  Optional<MessageReadReceipt> findByMessageIdAndRecipientUserId(Long messageId, Long recipientUserId);
}
