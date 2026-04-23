package com.example.backend.messaging.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.dto.SendMessageRequest;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.entity.Message;
import com.example.backend.messaging.entity.MessageDeliveryState;
import com.example.backend.messaging.entity.MessageReadReceipt;
import com.example.backend.messaging.entity.MessageType;
import com.example.backend.messaging.repository.ConversationParticipantRepository;
import com.example.backend.messaging.repository.ConversationRepository;
import com.example.backend.messaging.repository.MessageReadReceiptRepository;
import com.example.backend.messaging.repository.MessageRepository;
import com.example.backend.messaging.websocket.MessagingEventPublisher;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

  @Mock
  private MessageRepository messageRepository;

  @Mock
  private MessageReadReceiptRepository readReceiptRepository;

  @Mock
  private ConversationParticipantRepository participantRepository;

  @Mock
  private ConversationRepository conversationRepository;

  @Mock
  private MessageMapper messageMapper;

  @Mock
  private MessagingEventPublisher eventPublisher;

  @Mock
  private PresenceService presenceService;

  @Mock
  private OfflineDeliveryService offlineDeliveryService;

  @InjectMocks
  private MessageService messageService;

  @Test
  void sendMessage_shouldSaveMessage_andPublishEvent() {
    Conversation conv = new Conversation("1_2", 1L);
    when(conversationRepository.findById(1L)).thenReturn(Optional.of(conv));
    when(participantRepository.findByConversationId(1L)).thenReturn(List.of());
    when(messageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(messageMapper.toResponse(any(), any())).thenReturn(
        new MessageResponse(1L, 1L, 1L, "Sender", "Hello",
            MessageType.TEXT, MessageDeliveryState.SENT, "c1",
            null, null, null));
    UserAccount sender = new UserAccount("Sender", "sender@test.com", "pass", UserRole.USER);
    SendMessageRequest request = new SendMessageRequest(1L, "Hello", "c1");

    MessageResponse result = messageService.sendMessage(sender, request);

    assertThat(result.body()).isEqualTo("Hello");
    verify(messageRepository).save(any(Message.class));
    verify(eventPublisher).publishMessage(any(), any());
  }

  @Test
  void markRead_shouldUpdateReadAt_andPublishEvent() {
    Conversation conv = new Conversation("1_2", 1L);
    Message msg = new Message(conv, 2L, "Hello", "c1");
    MessageReadReceipt receipt = new MessageReadReceipt(msg, 1L);

    when(readReceiptRepository.findByMessageIdAndRecipientUserId(1L, 1L))
        .thenReturn(Optional.of(receipt));

    messageService.markRead(1L, 1L);

    assertThat(receipt.getReadAt()).isNotNull();
    verify(readReceiptRepository).save(receipt);
    verify(eventPublisher).publishRead(any(), any());
  }
}
