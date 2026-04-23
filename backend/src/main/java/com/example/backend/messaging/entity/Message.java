package com.example.backend.messaging.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_msg_conversation_created", columnList = "conversation_id, created_at, id"),
        @Index(name = "idx_msg_sender_created", columnList = "sender_user_id, created_at")
    }
)
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "conversation_id", nullable = false)
  private Conversation conversation;

  @Column(name = "sender_user_id", nullable = false)
  private Long senderUserId;

  @Column(name = "body", nullable = false, length = 4000)
  private String body;

  @Enumerated(EnumType.STRING)
  @Column(name = "message_type", nullable = false, length = 16)
  private MessageType messageType = MessageType.TEXT;

  @Enumerated(EnumType.STRING)
  @Column(name = "delivery_state", nullable = false, length = 16)
  private MessageDeliveryState deliveryState = MessageDeliveryState.SENT;

  @Column(name = "client_message_id", length = 64)
  private String clientMessageId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected Message() {
  }

  public Message(Conversation conversation, Long senderUserId, String body, String clientMessageId) {
    this.conversation = conversation;
    this.senderUserId = senderUserId;
    this.body = body;
    this.clientMessageId = clientMessageId;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public Conversation getConversation() {
    return conversation;
  }

  public Long getSenderUserId() {
    return senderUserId;
  }

  public String getBody() {
    return body;
  }

  public MessageType getMessageType() {
    return messageType;
  }

  public void setMessageType(MessageType messageType) {
    this.messageType = messageType;
  }

  public MessageDeliveryState getDeliveryState() {
    return deliveryState;
  }

  public void setDeliveryState(MessageDeliveryState deliveryState) {
    this.deliveryState = deliveryState;
  }

  public String getClientMessageId() {
    return clientMessageId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Message message = (Message) o;
    return Objects.equals(id, message.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
