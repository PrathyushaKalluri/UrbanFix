package com.example.backend.messaging.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.repository.UserRepository;
import com.example.backend.messaging.dto.ConversationSummaryResponse;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.entity.ConversationParticipant;
import com.example.backend.messaging.repository.ConversationParticipantRepository;
import com.example.backend.messaging.repository.ConversationRepository;
import com.example.backend.messaging.repository.MessageRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

  @Mock
  private ConversationRepository conversationRepository;

  @Mock
  private ConversationParticipantRepository participantRepository;

  @Mock
  private MessageRepository messageRepository;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private ConversationService conversationService;

  @Test
  void findOrCreateConversation_shouldCreateNew_whenNotExists() {
    when(conversationRepository.findByConversationKey(any())).thenReturn(Optional.empty());
    when(conversationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    Conversation result = conversationService.findOrCreateConversation(1L, 2L);

    assertThat(result).isNotNull();
    verify(conversationRepository).save(any(Conversation.class));
    verify(participantRepository, org.mockito.Mockito.times(2)).save(any(ConversationParticipant.class));
  }

  @Test
  void findOrCreateConversation_shouldReturnExisting_whenExists() {
    Conversation existing = new Conversation("1_2", 1L);
    when(conversationRepository.findByConversationKey("1_2")).thenReturn(Optional.of(existing));

    Conversation result = conversationService.findOrCreateConversation(1L, 2L);

    assertThat(result).isEqualTo(existing);
  }

  @Test
  void findOrCreateConversation_shouldThrow_whenSelfMessaging() {
    assertThatThrownBy(() -> conversationService.findOrCreateConversation(1L, 1L))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("yourself");
  }

  @Test
  void isParticipant_shouldReturnTrue_whenActive() {
    ConversationParticipant participant = new ConversationParticipant(new Conversation("1_2", 1L), 1L);
    when(participantRepository.findByConversationIdAndUserId(1L, 1L))
        .thenReturn(Optional.of(participant));

    assertThat(conversationService.isParticipant(1L, 1L)).isTrue();
  }

  @Test
  void listConversationsForUser_shouldReturnSummaries() {
    Conversation conv = new Conversation("1_2", 1L);
    ConversationParticipant participant1 = new ConversationParticipant(conv, 1L);
    ConversationParticipant participant2 = new ConversationParticipant(conv, 2L);

    when(participantRepository.findByUserId(1L)).thenReturn(List.of(participant1, participant2));
    when(participantRepository.findByConversationId(any())).thenReturn(List.of(participant1, participant2));
    when(userRepository.findById(2L)).thenReturn(Optional.of(new UserAccount("Expert", "expert@test.com", "pass", UserRole.EXPERT)));
    when(messageRepository.countUnreadByConversationAndUser(any(), any())).thenReturn(0L);

    List<ConversationSummaryResponse> result = conversationService.listConversationsForUser(1L);

    assertThat(result).hasSize(1);
  }
}
