package com.example.backend.messaging.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.entity.ConversationParticipant;
import com.example.backend.messaging.entity.Message;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
class ConversationRepositoryTest {

  @Autowired
  private ConversationRepository conversationRepository;

  @Autowired
  private ConversationParticipantRepository participantRepository;

  @Test
  void findByConversationKey_shouldReturnConversation_whenExists() {
    Conversation conv = new Conversation("1_2", 1L);
    conversationRepository.save(conv);

    Optional<Conversation> found = conversationRepository.findByConversationKey("1_2");

    assertThat(found).isPresent();
    assertThat(found.get().getConversationKey()).isEqualTo("1_2");
    assertThat(found.get().getCreatedByUserId()).isEqualTo(1L);
  }

  @Test
  void findByConversationKey_shouldReturnEmpty_whenNotExists() {
    Optional<Conversation> found = conversationRepository.findByConversationKey("999_888");
    assertThat(found).isEmpty();
  }

  @Test
  void save_shouldGenerateId() {
    Conversation conv = new Conversation("3_4", 3L);
    Conversation saved = conversationRepository.save(conv);
    assertThat(saved.getId()).isNotNull();
  }
}
