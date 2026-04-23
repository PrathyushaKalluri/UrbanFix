package com.example.backend.messaging.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.entity.Message;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
class MessageRepositoryTest {

  @Autowired
  private MessageRepository messageRepository;

  @Autowired
  private ConversationRepository conversationRepository;

  @Test
  void findByConversationIdOrderByCreatedAtAscIdAsc_shouldReturnOrderedMessages() {
    Conversation conv = new Conversation("1_2", 1L);
    conversationRepository.save(conv);

    Message msg1 = new Message(conv, 1L, "First", "c1");
    Message msg2 = new Message(conv, 2L, "Second", "c2");
    messageRepository.save(msg1);
    messageRepository.save(msg2);

    List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAscIdAsc(conv.getId());

    assertThat(messages).hasSize(2);
    assertThat(messages.get(0).getBody()).isEqualTo("First");
    assertThat(messages.get(1).getBody()).isEqualTo("Second");
  }

  @Test
  void findTopByConversationIdOrderByCreatedAtDesc_shouldReturnLatestMessage() throws InterruptedException {
    Conversation conv = new Conversation("1_2", 1L);
    conversationRepository.save(conv);

    Message msg1 = new Message(conv, 1L, "First", "c1");
    messageRepository.save(msg1);
    Thread.sleep(10);
    Message msg2 = new Message(conv, 2L, "Second", "c2");
    messageRepository.save(msg2);

    var latest = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conv.getId());

    assertThat(latest).isPresent();
    assertThat(latest.get().getBody()).isEqualTo("Second");
  }
}
